/**
 * Database Seed Script
 * Creates initial admin user and sample data
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { User, FAQ, Document } = require('../models');
const logger = require('../config/logger');

const seedData = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ai_support_chat');
    logger.info('Connected to MongoDB for seeding');

    // Clear existing data (optional - comment out in production)
    // await User.deleteMany({});
    // await FAQ.deleteMany({});
    // logger.info('Cleared existing data');

    // Create admin user
    const adminExists = await User.findOne({ email: 'admin@example.com' });
    
    if (!adminExists) {
      const admin = await User.create({
        email: 'admin@example.com',
        password: 'Admin@123',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        isActive: true,
        isVerified: true
      });
      logger.info(`Admin user created: ${admin.email}`);
    } else {
      logger.info('Admin user already exists');
    }

    // Create sample user
    const userExists = await User.findOne({ email: 'user@example.com' });
    
    if (!userExists) {
      const user = await User.create({
        email: 'user@example.com',
        password: 'User@123',
        firstName: 'Test',
        lastName: 'User',
        role: 'user',
        isActive: true,
        isVerified: true
      });
      logger.info(`Sample user created: ${user.email}`);
    } else {
      logger.info('Sample user already exists');
    }

    // Create sample FAQs
    const faqCount = await FAQ.countDocuments();
    
    if (faqCount === 0) {
      const admin = await User.findOne({ role: 'admin' });
      
      const sampleFAQs = [
        {
          question: 'What are your business hours?',
          answer: 'Our customer support is available 24/7. Our physical offices are open Monday to Friday, 9 AM to 6 PM IST.',
          category: 'General',
          keywords: ['hours', 'business', 'support', 'available', 'open'],
          priority: 100,
          createdBy: admin._id
        },
        {
          question: 'How do I reset my password?',
          answer: 'To reset your password: 1) Click "Forgot Password" on the login page, 2) Enter your email address, 3) Check your email for the reset link, 4) Click the link and create a new password. If you don\'t receive the email within 5 minutes, check your spam folder.',
          category: 'Account',
          keywords: ['password', 'reset', 'forgot', 'login', 'account'],
          priority: 95,
          createdBy: admin._id
        },
        {
          question: 'What payment methods do you accept?',
          answer: 'We accept all major credit cards (Visa, MasterCard, American Express, Discover), PayPal, bank transfers, and cryptocurrency (Bitcoin, Ethereum). For enterprise customers, we also offer invoicing options.',
          category: 'Billing',
          keywords: ['payment', 'credit card', 'paypal', 'billing', 'invoice'],
          priority: 90,
          createdBy: admin._id
        },
        {
          question: 'How can I cancel my subscription?',
          answer: 'You can cancel your subscription anytime by going to Settings > Subscription > Cancel Plan. Your access will continue until the end of your current billing period. No refunds are provided for partial months.',
          category: 'Billing',
          keywords: ['cancel', 'subscription', 'refund', 'plan'],
          priority: 85,
          createdBy: admin._id
        },
        {
          question: 'Do you offer refunds?',
          answer: 'We offer a 30-day money-back guarantee for new subscriptions. If you\'re not satisfied within the first 30 days, contact support for a full refund. After 30 days, refunds are evaluated on a case-by-case basis.',
          category: 'Billing',
          keywords: ['refund', 'money back', 'guarantee', 'return'],
          priority: 80,
          createdBy: admin._id
        },
        {
          question: 'How do I contact customer support?',
          answer: 'You can reach our support team through: 1) This AI chat assistant, 2) Email at karthikeya1111reddy@gmail.com or karthikeya.reddy.2201@gmail.com, 3) Phone at +91 7095226951, . Average response time is under 2 hours for email and immediate for chat.',
          category: 'General',
          keywords: ['contact', 'support', 'help', 'email', 'phone'],
          priority: 100,
          createdBy: admin._id
        },
        {
          question: 'Is my data secure?',
          answer: 'Yes, we take security seriously. All data is encrypted in transit (TLS 1.3) and at rest (AES-256). We are SOC 2 Type II certified and GDPR compliant. We never sell your data to third parties.',
          category: 'Security',
          keywords: ['security', 'data', 'privacy', 'encrypted', 'gdpr'],
          priority: 90,
          createdBy: admin._id
        },
        {
          question: 'What features are included in the free plan?',
          answer: 'The free plan includes: Up to 100 messages per month, Basic AI assistance, Email support, 1 user account. For unlimited messages and advanced features, consider our Pro or Enterprise plans.',
          category: 'Plans',
          keywords: ['free', 'plan', 'features', 'pricing', 'included'],
          priority: 85,
          createdBy: admin._id
        }
      ];

      await FAQ.insertMany(sampleFAQs);
      logger.info(`Created ${sampleFAQs.length} sample FAQs`);
    } else {
      logger.info('FAQs already exist');
    }

    logger.info('✅ Database seeding completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedData();
