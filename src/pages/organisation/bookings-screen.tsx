import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { useFirebaseUser } from 'src/hooks/useFirebaseUser';
import { useMode } from 'src/hooks/useMode';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from 'src/services/firebase/config';
import { httpsCallable } from 'firebase/functions';
import { functions } from 'src/services/firebase/config';
import { getOrganisation, Organisation } from 'src/services/firebase/organisation';
import moment from 'moment';

interface Class {
  classId: string;
  name: string;
  description?: string;
  instructor?: string;
  date: any; // Firestore Timestamp
  startTime: string;
  endTime: string;
  capacity: number;
  bookedCount: number;
}

interface Booking {
  bookingId: string;
  classId: string;
  status: string;
  bookedAt: any;
  className?: string;
  classDate?: Date;
  classTime?: string;
}

// Gym-type organisations that support bookings
const GYM_TYPES = ['gym', 'yoga', 'pilates', 'hiit', 'sauna'];

export const BookingsScreen = ({ navigation }: { navigation: any }) => {
  const { userId } = useFirebaseUser();
  const { organisation: modeOrganisation, isConsumerMode, loading: modeLoading } = useMode();
  const [organisation, setOrganisation] = useState<Organisation | null>(null);
  const [classes, setClasses] = useState<Class[]>([]);
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [bookingClassId, setBookingClassId] = useState<string | null>(null);
  const [joinWaitlistClassId, setJoinWaitlistClassId] = useState<string | null>(null);
  const [hasDirectOrganisation, setHasDirectOrganisation] = useState(false);

  useEffect(() => {
    // If useMode loaded successfully, use that data
    if (!modeLoading && modeOrganisation) {
      setOrganisation(modeOrganisation);
      // Only load if this is a gym-type organisation
      const isGymType = modeOrganisation.type && GYM_TYPES.includes(modeOrganisation.type);
      if (isGymType) {
        loadDataWithOrganisation(modeOrganisation);
      } else {
        setLoading(false);
      }
    } else if (!modeLoading && isConsumerMode) {
      // If useMode says consumer mode, check Firestore directly as fallback
      checkDirectOrganisation();
    } else if (!modeLoading) {
      setLoading(false);
    }
  }, [userId, modeOrganisation, modeLoading, isConsumerMode]);

  // Fallback: Check Firestore directly if useMode fails
  const checkDirectOrganisation = async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      console.log("BookingsScreen: Checking Firestore directly for organisation...");
      const userDoc = await getDoc(doc(db, "users", userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        // Check for organisations array (new multi-org support) or legacy organisationId
        const hasOrgArray = userData?.organisations && Array.isArray(userData.organisations) && userData.organisations.length > 0;
        const activeOrgId = userData?.activeOrganisationId;
        const legacyOrgId = userData?.organisationId; // Backwards compatibility
        
        // Use activeOrganisationId if available, otherwise use first in array, otherwise use legacy
        const organisationId = activeOrgId || (hasOrgArray ? userData.organisations[0] : null) || legacyOrgId;
        
        if (organisationId) {
          console.log("BookingsScreen: Found organisation:", {
            organisationId,
            organisations: userData?.organisations,
            activeOrganisationId: userData?.activeOrganisationId
          });
          setHasDirectOrganisation(true);
          const orgData = await getOrganisation(organisationId);
          if (orgData) {
            console.log("BookingsScreen: Loaded organisation:", orgData.name, "Type:", orgData.type);
            setOrganisation(orgData);
            // Only load if this is a gym-type organisation
            const isGymType = orgData.type && GYM_TYPES.includes(orgData.type);
            console.log("BookingsScreen: Is gym type:", isGymType);
            if (isGymType) {
              // Pass orgData directly to avoid state timing issues
              loadDataWithOrganisation(orgData);
            } else {
              setLoading(false);
            }
            return;
          }
        }
      }
    } catch (error) {
      console.error("Error checking direct organisation:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadData = async () => {
    const orgToUse = organisation || modeOrganisation;
    if (!userId || !orgToUse?.organisationId) {
      console.log("BookingsScreen: Cannot load data - missing userId or organisationId");
      setLoading(false);
      return;
    }

    loadDataWithOrganisation(orgToUse);
  };

  const loadDataWithOrganisation = async (orgData: Organisation) => {
    if (!userId || !orgData?.organisationId) {
      console.log("BookingsScreen: Cannot load data - missing userId or organisationId");
      setLoading(false);
      return;
    }

    console.log("BookingsScreen: Loading data for organisation:", orgData.organisationId);
    try {
      await Promise.all([loadClasses(orgData), loadMyBookings(orgData)]);
      console.log("BookingsScreen: Data loaded successfully");
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadClasses = async (orgData?: Organisation) => {
    const orgToUse = orgData || organisation || modeOrganisation;
    if (!orgToUse?.organisationId) {
      console.log("BookingsScreen: Cannot load classes - no organisationId");
      return;
    }

    if (!userId) {
      console.log("BookingsScreen: Cannot load classes - no userId");
      return;
    }

    console.log("BookingsScreen: Loading classes for organisation:", orgToUse.organisationId);
    try {
      // Try Cloud Function first (bypasses Firestore permission issues for booking counts)
      try {
        const getClassesFn = httpsCallable(functions, 'getClassesWithBookingCounts');
        const result = await getClassesFn({ organisationId: orgToUse.organisationId });
        const data = result.data as { classes: Class[] };
        const classesList = data.classes || [];
        console.log("BookingsScreen: Loaded", classesList.length, "classes via Cloud Function");
        setClasses(classesList);
        return;
      } catch (callableError: any) {
        // Fallback if callable fails (not-found, unauthenticated, etc.)
        console.log("BookingsScreen: Callable failed, falling back to Firestore:", callableError?.code || callableError?.message);
      }

      // Fallback: load classes directly from Firestore (booking count may show 0 due to permissions)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const classesQuery = query(
        collection(db, 'classes'),
        where('organisationId', '==', orgToUse.organisationId)
      );
      const snapshot = await getDocs(classesQuery);
      const classesList: Class[] = [];

      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        const classDate = data.date?.toDate ? data.date.toDate() : new Date(data.date);
        const daysDiff = Math.floor((classDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (daysDiff >= 0 && daysDiff <= 30) {
          let bookedCount = 0;
          try {
            const bookingsQuery = query(
              collection(db, 'bookings'),
              where('classId', '==', docSnap.id)
            );
            const bookingsSnapshot = await getDocs(bookingsQuery);
            bookedCount = bookingsSnapshot.docs.filter(d => d.data().status === 'confirmed').length;
          } catch {
            bookedCount = 0;
          }
          classesList.push({
            classId: docSnap.id,
            name: data.name || 'Unnamed Class',
            description: data.description,
            instructor: data.instructor,
            date: data.date,
            startTime: data.startTime || '',
            endTime: data.endTime || '',
            capacity: data.capacity || 0,
            bookedCount,
          });
        }
      }
      classesList.sort((a, b) => {
        const dateA = a.date?.toDate ? a.date.toDate() : new Date(a.date);
        const dateB = b.date?.toDate ? b.date.toDate() : new Date(b.date);
        return dateA.getTime() - dateB.getTime();
      });
      console.log("BookingsScreen: Loaded", classesList.length, "classes via Firestore fallback");
      setClasses(classesList);
    } catch (error: any) {
      console.error('Error loading classes:', error);
      Alert.alert('Error', error.message || 'Failed to load classes');
    }
  };

  const loadMyBookings = async (orgData?: Organisation) => {
    const orgToUse = orgData || organisation || modeOrganisation;
    if (!userId || !orgToUse?.organisationId) {
      console.log("BookingsScreen: Cannot load bookings - missing userId or organisationId");
      return;
    }

    console.log("BookingsScreen: Loading bookings for user:", userId, "organisation:", orgToUse.organisationId);
    try {
      // Query by userId and organisationId first, then filter by status in-memory to avoid index requirement
      const bookingsQuery = query(
        collection(db, 'bookings'),
        where('userId', '==', userId),
        where('organisationId', '==', orgToUse.organisationId)
      );

      const snapshot = await getDocs(bookingsQuery);
      const bookingsList: Booking[] = [];

      for (const bookingDoc of snapshot.docs) {
        const data = bookingDoc.data();
        
        // Filter by status in-memory
        if (data.status !== 'confirmed') {
          continue;
        }

        // Get class details
        try {
          const classDoc = await getDoc(doc(db, 'classes', data.classId));
          
          let className = 'Unknown Class';
          let classDate: Date | undefined;
          let classTime = '';

          if (classDoc.exists()) {
            const classData = classDoc.data();
            className = classData.name || 'Unknown Class';
            classDate = classData.date?.toDate ? classData.date.toDate() : new Date(classData.date);
            classTime = `${classData.startTime || ''} - ${classData.endTime || ''}`;
          }

          bookingsList.push({
            bookingId: bookingDoc.id,
            classId: data.classId,
            status: data.status,
            bookedAt: data.bookedAt,
            className,
            classDate,
            classTime,
          });
        } catch (error) {
          console.error('Error loading class details for booking:', error);
          // Still add booking even if class details fail
          bookingsList.push({
            bookingId: bookingDoc.id,
            classId: data.classId,
            status: data.status,
            bookedAt: data.bookedAt,
          });
        }
      }

      // Sort bookings by bookedAt descending (most recent first)
      bookingsList.sort((a, b) => {
        const bookedAtA = a.bookedAt?.toDate ? a.bookedAt.toDate() : new Date(a.bookedAt);
        const bookedAtB = b.bookedAt?.toDate ? b.bookedAt.toDate() : new Date(b.bookedAt);
        return bookedAtB.getTime() - bookedAtA.getTime(); // Descending order
      });

      console.log("BookingsScreen: Loaded", bookingsList.length, "bookings");
      setMyBookings(bookingsList);
    } catch (error) {
      console.error('Error loading bookings:', error);
    }
  };

  const handleBookClass = async (classId: string) => {
    const orgToUse = organisation || modeOrganisation;
    if (!userId || !orgToUse) {
      Alert.alert('Error', 'Unable to book class');
      return;
    }

    setBookingClassId(classId);

    try {
      const bookClassFunction = httpsCallable(functions, 'bookClass');
      const result = await bookClassFunction({
        classId,
        organisationId: orgToUse.organisationId,
      });

      if ((result.data as any).success) {
        Alert.alert('Success', 'Class booked successfully!');
        await loadData(); // Reload to update availability
      } else {
        Alert.alert('Error', (result.data as any).message || 'Failed to book class');
      }
    } catch (error: any) {
      console.error('Error booking class:', error);
      const message = error?.details || error?.message || 'Failed to book class. Please check you have an active membership or pack.';
      Alert.alert('Error', message);
    } finally {
      setBookingClassId(null);
    }
  };

  const handleJoinWaitlist = async (classId: string) => {
    const orgToUse = organisation || modeOrganisation;
    if (!userId || !orgToUse) {
      Alert.alert('Error', 'Unable to join waitlist');
      return;
    }

    setJoinWaitlistClassId(classId);
    try {
      const joinWaitlistFn = httpsCallable(functions, 'joinWaitlist');
      const result = await joinWaitlistFn({ classId, organisationId: orgToUse.organisationId });
      if ((result.data as any).success) {
        Alert.alert('Success', 'You\'ve been added to the waitlist. We\'ll email you if a spot opens up.');
        await loadData();
      } else {
        Alert.alert('Error', (result.data as any).message || 'Failed to join waitlist');
      }
    } catch (error: any) {
      const msg = error?.details || error?.message || 'Failed to join waitlist';
      Alert.alert('Error', msg);
    } finally {
      setJoinWaitlistClassId(null);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking?',
      [
        {
          text: 'No',
          style: 'cancel',
        },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              const cancelBookingFn = httpsCallable(functions, 'cancelBooking');
              await cancelBookingFn({ bookingId });
              Alert.alert('Success', 'Booking cancelled');
              await loadData();
            } catch (error: any) {
              console.error('Error cancelling booking:', error);
              const message = error?.details || error?.message || 'Failed to cancel booking';
              Alert.alert('Error', message);
            }
          },
        },
      ]
    );
  };

  const onRefresh = () => {
    setRefreshing(true);
    const orgToUse = organisation || modeOrganisation;
    if (orgToUse) {
      loadDataWithOrganisation(orgToUse);
    } else {
      loadData();
    }
  };

  if (modeLoading || loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Book Classes</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6366f1" />
        </View>
      </View>
    );
  }

  const orgToUse = organisation || modeOrganisation;
  const isGymType = orgToUse?.type && GYM_TYPES.includes(orgToUse.type);

  if ((isConsumerMode && !hasDirectOrganisation) || !orgToUse || !isGymType) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Book Classes</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>Bookings Not Available</Text>
          <Text style={styles.emptyText}>
            {!organisation
              ? 'Class bookings are only available for organisation members.'
              : 'Class bookings are only available for gym-type organisations.'}
          </Text>
        </View>
      </View>
    );
  }

  const isClassBooked = (classId: string) => {
    return myBookings.some(b => b.classId === classId && b.status === 'confirmed');
  };

  const getSpotsRemaining = (classItem: Class) => {
    return Math.max(0, classItem.capacity - classItem.bookedCount);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book Classes</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* My Bookings Section */}
        {myBookings.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>My Bookings</Text>
            {myBookings.map(booking => (
              <View key={booking.bookingId} style={styles.bookingCard}>
                <Text style={styles.bookingClassName}>{booking.className}</Text>
                {booking.classDate && (
                  <Text style={styles.bookingDate}>
                    {moment(booking.classDate).format('MMM D, YYYY')} • {booking.classTime}
                  </Text>
                )}
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => handleCancelBooking(booking.bookingId)}
                >
                  <Text style={styles.cancelButtonText}>Cancel Booking</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Upcoming Classes Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upcoming Classes</Text>
          {classes.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No upcoming classes scheduled</Text>
              <Text style={styles.emptySubtext}>
                Check back later or contact your organisation for schedule updates.
              </Text>
            </View>
          ) : (
            classes.map(classItem => {
              const classDate = classItem.date?.toDate ? classItem.date.toDate() : new Date(classItem.date);
              const isBooked = isClassBooked(classItem.classId);
              const spotsRemaining = getSpotsRemaining(classItem);
              const isFull = spotsRemaining === 0;
              const isBooking = bookingClassId === classItem.classId;

              return (
                <View key={classItem.classId} style={styles.classCard}>
                  <View style={styles.classHeader}>
                    <Text style={styles.className}>{classItem.name}</Text>
                    {isBooked && (
                      <View style={styles.bookedBadge}>
                        <Text style={styles.bookedBadgeText}>Booked</Text>
                      </View>
                    )}
                  </View>

                  {classItem.description && (
                    <Text style={styles.classDescription}>{classItem.description}</Text>
                  )}

                  <View style={styles.classDetails}>
                    <Text style={styles.classDetail}>
                      📅 {moment(classDate).format('MMM D, YYYY')}
                    </Text>
                    <Text style={styles.classDetail}>
                      🕐 {classItem.startTime} - {classItem.endTime}
                    </Text>
                    {classItem.instructor && (
                      <Text style={styles.classDetail}>
                        👤 {classItem.instructor}
                      </Text>
                    )}
                    <Text style={styles.classDetail}>
                      👥 {spotsRemaining} spots remaining ({classItem.bookedCount}/{classItem.capacity})
                    </Text>
                  </View>

                  {!isBooked && (
                    isFull ? (
                      <TouchableOpacity
                        style={[
                          styles.bookButton,
                          joinWaitlistClassId === classItem.classId && styles.bookButtonDisabled
                        ]}
                        onPress={() => handleJoinWaitlist(classItem.classId)}
                        disabled={!!joinWaitlistClassId}
                      >
                        {joinWaitlistClassId === classItem.classId ? (
                          <ActivityIndicator color="#fff" />
                        ) : (
                          <Text style={styles.bookButtonText}>Join Waitlist</Text>
                        )}
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={[
                          styles.bookButton,
                          isBooking && styles.bookButtonDisabled
                        ]}
                        onPress={() => handleBookClass(classItem.classId)}
                        disabled={!!isBooking}
                      >
                        {isBooking ? (
                          <ActivityIndicator color="#fff" />
                        ) : (
                          <Text style={styles.bookButtonText}>Book Class</Text>
                        )}
                      </TouchableOpacity>
                    )
                  )}
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButtonText: {
    fontSize: 16,
    color: '#6366f1',
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  placeholder: {
    width: 60,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  classCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  classHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  className: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  bookedBadge: {
    backgroundColor: '#10b981',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  bookedBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  classDescription: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  classDetails: {
    marginBottom: 12,
  },
  classDetail: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 4,
  },
  bookButton: {
    backgroundColor: '#6366f1',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  bookButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  bookButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  bookingCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  bookingClassName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  bookingDate: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  cancelButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#fee2e2',
  },
  cancelButtonText: {
    color: '#dc2626',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
  },
  emptySubtext: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 8,
  },
});

