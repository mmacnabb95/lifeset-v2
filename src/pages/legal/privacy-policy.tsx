import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export const PrivacyPolicyScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Privacy Policy</Text>
        <Text style={styles.lastUpdated}>Last Updated: January 26, 2025</Text>

        <Text style={styles.sectionTitle}>1. Introduction</Text>
        <Text style={styles.paragraph}>
          Welcome to LifeSet ("we", "us", or "our"). We respect your privacy and are committed to 
          protecting your personal data. This privacy policy explains how we collect, use, and 
          safeguard your information when you use our mobile application.
        </Text>

        <Text style={styles.sectionTitle}>2. Information We Collect</Text>
        <Text style={styles.paragraph}>
          We collect the following types of information:
        </Text>
        <Text style={styles.bulletPoint}>
          • Account Information: Email address, username, and password
        </Text>
        <Text style={styles.bulletPoint}>
          • Usage Data: Habit tracking data, workout logs, journal entries, and meditation sessions
        </Text>
        <Text style={styles.bulletPoint}>
          • Profile Information: Profile picture (optional), XP level, and streak data
        </Text>
        <Text style={styles.bulletPoint}>
          • Device Information: Device type, operating system, and app version
        </Text>
        <Text style={styles.bulletPoint}>
          • Subscription Data: Subscription status and purchase history (managed by RevenueCat and Apple/Google)
        </Text>

        <Text style={styles.sectionTitle}>3. How We Use Your Information</Text>
        <Text style={styles.paragraph}>
          We use your information to:
        </Text>
        <Text style={styles.bulletPoint}>
          • Provide and maintain our services
        </Text>
        <Text style={styles.bulletPoint}>
          • Track your progress and provide personalized insights
        </Text>
        <Text style={styles.bulletPoint}>
          • Sync your data across devices
        </Text>
        <Text style={styles.bulletPoint}>
          • Process subscription payments
        </Text>
        <Text style={styles.bulletPoint}>
          • Send important updates about your account or our services
        </Text>
        <Text style={styles.bulletPoint}>
          • Improve and optimize our app
        </Text>

        <Text style={styles.sectionTitle}>4. Data Storage and Security</Text>
        <Text style={styles.paragraph}>
          Your data is stored securely using Firebase (Google Cloud Platform) with industry-standard 
          encryption. We implement appropriate technical and organizational measures to protect your 
          personal information against unauthorized access, alteration, disclosure, or destruction.
        </Text>

        <Text style={styles.sectionTitle}>5. Third-Party Services</Text>
        <Text style={styles.paragraph}>
          We use the following third-party services:
        </Text>
        <Text style={styles.bulletPoint}>
          • Firebase (Google): Data storage and authentication
        </Text>
        <Text style={styles.bulletPoint}>
          • RevenueCat: Subscription management
        </Text>
        <Text style={styles.bulletPoint}>
          • Apple App Store / Google Play: Payment processing
        </Text>
        <Text style={styles.paragraph}>
          These services have their own privacy policies governing their use of your information.
        </Text>

        <Text style={styles.sectionTitle}>6. Data Sharing</Text>
        <Text style={styles.paragraph}>
          We do not sell, trade, or rent your personal information to third parties. We may share 
          your information only in the following circumstances:
        </Text>
        <Text style={styles.bulletPoint}>
          • With your explicit consent
        </Text>
        <Text style={styles.bulletPoint}>
          • With service providers who assist in operating our app (under strict confidentiality)
        </Text>
        <Text style={styles.bulletPoint}>
          • To comply with legal obligations or protect our rights
        </Text>

        <Text style={styles.sectionTitle}>7. Your Rights</Text>
        <Text style={styles.paragraph}>
          You have the right to:
        </Text>
        <Text style={styles.bulletPoint}>
          • Access your personal data
        </Text>
        <Text style={styles.bulletPoint}>
          • Correct inaccurate data
        </Text>
        <Text style={styles.bulletPoint}>
          • Request deletion of your data
        </Text>
        <Text style={styles.bulletPoint}>
          • Export your data
        </Text>
        <Text style={styles.bulletPoint}>
          • Withdraw consent for data processing
        </Text>
        <Text style={styles.paragraph}>
          To exercise these rights, please contact us at privacy@lifesetwellbeing.com
        </Text>

        <Text style={styles.sectionTitle}>8. Data Retention</Text>
        <Text style={styles.paragraph}>
          We retain your personal information for as long as your account is active or as needed to 
          provide you services. You may request deletion of your account and data at any time.
        </Text>

        <Text style={styles.sectionTitle}>9. Children's Privacy</Text>
        <Text style={styles.paragraph}>
          Our service is not intended for users under the age of 13. We do not knowingly collect 
          personal information from children under 13. If you believe we have collected data from 
          a child, please contact us immediately.
        </Text>

        <Text style={styles.sectionTitle}>10. International Data Transfers</Text>
        <Text style={styles.paragraph}>
          Your information may be transferred to and stored on servers located outside your country. 
          By using our service, you consent to this transfer.
        </Text>

        <Text style={styles.sectionTitle}>11. Changes to This Privacy Policy</Text>
        <Text style={styles.paragraph}>
          We may update this privacy policy from time to time. We will notify you of any changes by 
          updating the "Last Updated" date. Continued use of the app after changes constitutes 
          acceptance of the updated policy.
        </Text>

        <Text style={styles.sectionTitle}>12. Contact Us</Text>
        <Text style={styles.paragraph}>
          If you have questions about this Privacy Policy, please contact us:
        </Text>
        <Text style={styles.contactInfo}>Email: privacy@lifesetwellbeing.com</Text>
        <Text style={styles.contactInfo}>Website: www.lifesetwellbeing.com</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  lastUpdated: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1a1a1a',
    marginTop: 20,
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 12,
  },
  bulletPoint: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 8,
    paddingLeft: 16,
  },
  contactInfo: {
    fontSize: 16,
    color: '#667eea',
    fontWeight: '600',
    marginTop: 8,
  },
});

