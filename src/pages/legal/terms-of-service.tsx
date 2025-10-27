import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export const TermsOfServiceScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Terms of Service</Text>
        <Text style={styles.lastUpdated}>Last Updated: January 26, 2025</Text>

        <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
        <Text style={styles.paragraph}>
          By accessing or using LifeSet ("the App"), you agree to be bound by these Terms of 
          Service ("Terms"). If you do not agree to these Terms, please do not use the App.
        </Text>

        <Text style={styles.sectionTitle}>2. Description of Service</Text>
        <Text style={styles.paragraph}>
          LifeSet is a personal wellness application that provides tools for habit tracking, 
          workout planning, journaling, meditation, and nutrition guidance. The App is available 
          on a subscription basis with a free trial period.
        </Text>

        <Text style={styles.sectionTitle}>3. Subscription and Billing</Text>
        <Text style={styles.paragraph}>
          LifeSet offers a subscription service with a 7-day free trial for new subscribers:
        </Text>
        <Text style={styles.bulletPoint}>
          • After the trial period, your subscription will automatically renew at the standard rate
        </Text>
        <Text style={styles.bulletPoint}>
          • You can cancel your subscription at any time before the trial ends to avoid charges
        </Text>
        <Text style={styles.bulletPoint}>
          • Subscriptions are billed through your Apple App Store or Google Play account
        </Text>
        <Text style={styles.bulletPoint}>
          • Prices are subject to change with advance notice
        </Text>
        <Text style={styles.bulletPoint}>
          • Refunds are handled according to Apple's and Google's respective refund policies
        </Text>
        <Text style={styles.bulletPoint}>
          • Cancellation does not result in a refund for the current billing period
        </Text>

        <Text style={styles.sectionTitle}>4. User Accounts</Text>
        <Text style={styles.paragraph}>
          To use the App, you must create an account:
        </Text>
        <Text style={styles.bulletPoint}>
          • You must provide accurate and complete information
        </Text>
        <Text style={styles.bulletPoint}>
          • You are responsible for maintaining the confidentiality of your account credentials
        </Text>
        <Text style={styles.bulletPoint}>
          • You are responsible for all activities that occur under your account
        </Text>
        <Text style={styles.bulletPoint}>
          • You must be at least 13 years old to create an account
        </Text>
        <Text style={styles.bulletPoint}>
          • You may not share your account with others
        </Text>

        <Text style={styles.sectionTitle}>5. Acceptable Use</Text>
        <Text style={styles.paragraph}>
          You agree not to:
        </Text>
        <Text style={styles.bulletPoint}>
          • Use the App for any illegal purposes
        </Text>
        <Text style={styles.bulletPoint}>
          • Attempt to gain unauthorized access to our systems or other users' accounts
        </Text>
        <Text style={styles.bulletPoint}>
          • Interfere with or disrupt the App's functionality
        </Text>
        <Text style={styles.bulletPoint}>
          • Upload malicious code, viruses, or harmful content
        </Text>
        <Text style={styles.bulletPoint}>
          • Reverse engineer, decompile, or disassemble the App
        </Text>
        <Text style={styles.bulletPoint}>
          • Use the App to harass, abuse, or harm others
        </Text>

        <Text style={styles.sectionTitle}>6. User Content</Text>
        <Text style={styles.paragraph}>
          You retain ownership of content you create in the App (habits, journal entries, etc.):
        </Text>
        <Text style={styles.bulletPoint}>
          • You grant us a license to store and process your content to provide the service
        </Text>
        <Text style={styles.bulletPoint}>
          • You are responsible for backing up your data
        </Text>
        <Text style={styles.bulletPoint}>
          • We reserve the right to remove content that violates these Terms
        </Text>

        <Text style={styles.sectionTitle}>7. Intellectual Property</Text>
        <Text style={styles.paragraph}>
          The App and its original content, features, and functionality are owned by LifeSet and 
          are protected by international copyright, trademark, patent, trade secret, and other 
          intellectual property laws.
        </Text>

        <Text style={styles.sectionTitle}>8. Health and Fitness Disclaimer</Text>
        <Text style={styles.paragraph}>
          The App provides general wellness information and tools:
        </Text>
        <Text style={styles.bulletPoint}>
          • Content is for informational purposes only and not medical advice
        </Text>
        <Text style={styles.bulletPoint}>
          • Always consult with a healthcare professional before starting any fitness program
        </Text>
        <Text style={styles.bulletPoint}>
          • We are not responsible for injuries or health issues resulting from using the App
        </Text>
        <Text style={styles.bulletPoint}>
          • You use the workout and nutrition features at your own risk
        </Text>

        <Text style={styles.sectionTitle}>9. Disclaimer of Warranties</Text>
        <Text style={styles.paragraph}>
          THE APP IS PROVIDED "AS IS" WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. 
          We do not guarantee that the App will be uninterrupted, secure, or error-free.
        </Text>

        <Text style={styles.sectionTitle}>10. Limitation of Liability</Text>
        <Text style={styles.paragraph}>
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, LifeSet SHALL NOT BE LIABLE FOR ANY INDIRECT, 
          INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR 
          REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, 
          OR OTHER INTANGIBLE LOSSES RESULTING FROM YOUR USE OF THE APP.
        </Text>

        <Text style={styles.sectionTitle}>11. Termination</Text>
        <Text style={styles.paragraph}>
          We may terminate or suspend your account and access to the App immediately, without 
          prior notice or liability, for any reason, including if you breach these Terms. Upon 
          termination, your right to use the App will immediately cease.
        </Text>

        <Text style={styles.sectionTitle}>12. Changes to Terms</Text>
        <Text style={styles.paragraph}>
          We reserve the right to modify these Terms at any time. We will notify users of any 
          material changes by updating the "Last Updated" date. Your continued use of the App 
          after changes constitutes acceptance of the modified Terms.
        </Text>

        <Text style={styles.sectionTitle}>13. Governing Law</Text>
        <Text style={styles.paragraph}>
          These Terms shall be governed by and construed in accordance with the laws of the 
          jurisdiction in which LifeSet operates, without regard to its conflict of law provisions.
        </Text>

        <Text style={styles.sectionTitle}>14. Contact Information</Text>
        <Text style={styles.paragraph}>
          If you have questions about these Terms, please contact us:
        </Text>
        <Text style={styles.contactInfo}>Email: matthew@lifesetwellbeing.com</Text>
        <Text style={styles.contactInfo}>Website: www.lifesetwellbeing.com</Text>

        <Text style={styles.sectionTitle}>15. Entire Agreement</Text>
        <Text style={styles.paragraph}>
          These Terms constitute the entire agreement between you and LifeSet regarding the use 
          of the App and supersede all prior agreements and understandings.
        </Text>
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
