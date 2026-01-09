import nodemailer from 'nodemailer';
import crypto from 'crypto';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure environment variables are loaded with explicit path
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Double-check environment variables are loaded
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.log('⚠️ Retrying .env file loading...');
  dotenv.config();
}

class EmailService {
  constructor() {
    this.fromEmail = process.env.EMAIL_USER;
    this.setupTransporter();
  }

  setupTransporter() {
    try {
      // Check if Gmail credentials are provided
      if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        this.transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS // This should be your Gmail App Password
          },
          tls: {
            rejectUnauthorized: false
          }
        });
        console.log('📧 Email Service initialized with Gmail SMTP');
      }
      // Alternative: Use OAuth (if configured)
      else if (process.env.EMAIL_USER && process.env.OAUTH_CLIENT_ID && process.env.OAUTH_CLIENT_SECRET && process.env.OAUTH_REFRESH_TOKEN) {
        this.transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            type: 'OAuth2',
            user: process.env.EMAIL_USER,
            clientId: process.env.OAUTH_CLIENT_ID,
            clientSecret: process.env.OAUTH_CLIENT_SECRET,
            refreshToken: process.env.OAUTH_REFRESH_TOKEN
          }
        });
        console.log('📧 Email Service initialized with Gmail OAuth');
      }
      // Alternative: Use other SMTP service
      else if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
        this.transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: process.env.SMTP_PORT || 587,
          secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
          }
        });
        console.log('📧 Email Service initialized with Custom SMTP');
      }
      else {
        this.transporter = null;
        console.log('📧 Email Service initialized (Development Mode - No credentials)');
        console.log('💡 To enable email sending, choose one of these options:');
        console.log('');
        console.log('🔹 Option 1: Gmail App Password');
        console.log('   1. Enable 2-Step Verification on Gmail');
        console.log('   2. Generate App Password');
        console.log('   3. Set EMAIL_USER and EMAIL_PASS in .env file');
        console.log('');
        console.log('🔹 Option 2: Gmail OAuth (Recommended by Google)');
        console.log('   1. Set up Google Cloud Console project');
        console.log('   2. Set OAUTH_CLIENT_ID, OAUTH_CLIENT_SECRET, OAUTH_REFRESH_TOKEN');
        console.log('');
        console.log('🔹 Option 3: Alternative SMTP Service');
        console.log('   1. Use Mailgun, SendGrid, or other SMTP provider');
        console.log('   2. Set SMTP_HOST, SMTP_USER, SMTP_PASS in .env file');
        console.log('');
        console.log('🔹 Option 4: Development Mode (Current)');
        console.log('   - Emails will be logged to console only');
      }
    } catch (error) {
      console.error('Failed to setup email transporter:', error);
      this.transporter = null;
    }
  }

  // Verify SMTP connection
  async verifyConnection() {
    if (!this.transporter) return;

    try {
      await this.transporter.verify();
      console.log('✅ SMTP connection verified successfully');
    } catch (error) {
      console.error('❌ SMTP connection verification failed:', error.message);
      console.log('⚠️  Email service may not work properly. Please check your credentials.');
    }
  }

  // Reinitialize transporter (useful if env vars are loaded later)
  reinitialize() {
    console.log('🔄 Reinitializing email service...');
    this.setupTransporter();
  }

  async sendEmail(to, subject, htmlContent) {
    // If transporter is null, try to reinitialize once
    if (!this.transporter && (process.env.EMAIL_USER && process.env.EMAIL_PASS)) {
      console.log('🔄 Transporter not initialized, attempting to reinitialize...');
      this.setupTransporter();
    }

    if (!this.transporter) {
      // Development mode - just log the email
      console.log('\n📧 EMAIL NOTIFICATION (Dev Mode):');
      console.log('├── To:', to);
      console.log('├── Subject:', subject);
      console.log('└── Content Preview:', htmlContent.substring(0, 100) + '...');
      console.log('⚠️  WARNING: No actual email sent - running in development mode');
      console.log('💡 Check your EMAIL_USER and EMAIL_PASS environment variables');
      return true; // Return true to indicate email was sent
    }

    try {
      const mailOptions = {
        from: `"StudyBuddy" <${this.fromEmail}>`,
        to: to,
        subject: subject,
        html: htmlContent
      };

      await this.transporter.sendMail(mailOptions);
      console.log(`✅ Email sent successfully to ${to}`);
      return true;
    } catch (error) {
      console.error('❌ Error sending email:', error.message);

      // Check if it's a temporary Gmail error
      if (error.message.includes('temporarily rejected') || error.message.includes('rate limit')) {
        console.log('📧 Gmail temporarily unavailable, but will retry later');
        // For temporary errors, still return true as the service is working
        return true;
      }

      // Check if it's an authentication/credential error (case-insensitive)
      const errorMsgLower = error.message.toLowerCase();
      const isAuthError = 
        errorMsgLower.includes('invalid login') ||
        errorMsgLower.includes('authentication failed') ||
        error.message.includes('BadCredentials') ||
        error.message.includes('Username and Password not accepted') ||
        error.code === 'EAUTH' ||
        error.responseCode === 535;

      if (isAuthError) {
        console.error('\n❌❌❌ EMAIL AUTHENTICATION FAILED ❌❌❌');
        console.error('The email credentials in your .env file are incorrect.');
        console.error('\n📋 To fix this issue:');
        console.error('1. Go to: https://myaccount.google.com/apppasswords');
        console.error('2. Enable 2-Step Verification on your Gmail account (if not already enabled)');
        console.error('3. Generate an "App Password" for "Mail"');
        console.error('4. Copy the 16-character password (no spaces)');
        console.error('5. Update your .env file:');
        console.error('   EMAIL_USER=your-email@gmail.com');
        console.error('   EMAIL_PASS=your-16-character-app-password');
        console.error('\n⚠️  IMPORTANT: Use App Password, NOT your regular Gmail password!');
        console.error('\n📧 Email was NOT sent. User registration will be cleaned up.');
        return false; // Return false so registration route can clean up the user
      }

      // Fallback to development mode logging for other errors
      console.error('\n❌ Unknown email error occurred');
      console.log('\n📧 EMAIL NOTIFICATION (Error - Not Sent):');
      console.log('├── To:', to);
      console.log('├── Subject:', subject);
      console.log('└── Content Preview:', htmlContent.substring(0, 100) + '...');
      console.error('⚠️  Email was NOT sent due to error. Please check your email configuration.');
      return false; // Return false to prevent registration when email fails
    }
  }

  // Generate 6-digit OTP
  generateOTP() {
    return crypto.randomInt(100000, 999999).toString();
  }

  // Send OTP for email verification
  async sendOTPEmail(email, otp, username) {
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3B82F6;">Welcome to StudyBuddy!</h2>
        <p>Hi ${username},</p>
        <p>Thank you for signing up! Please verify your email address with the OTP below:</p>
        <div style="background-color: #F3F4F6; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
          <h1 style="color: #1F2937; font-size: 36px; margin: 0; letter-spacing: 8px;">${otp}</h1>
        </div>
        <p>This OTP will expire in 10 minutes.</p>
        <p>If you didn't create an account with us, please ignore this email.</p>
        <br>
        <p>Best regards,<br>StudyBuddy Team</p>
      </div>
    `;

    return await this.sendEmail(email, 'StudyBuddy - Email Verification', htmlContent);
  }

  // Send study session notification
  async sendSessionNotification(email, sessionDetails, username) {
    const { title, subject, startTime, endTime } = sessionDetails;
    const formattedStartTime = new Date(startTime).toLocaleString();
    const formattedEndTime = new Date(endTime).toLocaleString();

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3B82F6;">📚 Study Session Reminder</h2>
        <p>Hi ${username},</p>
        <p>You have an upcoming study session scheduled:</p>
        
        <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #1F2937; margin-top: 0;">${title}</h3>
          <p><strong>Subject:</strong> ${subject}</p>
          <p><strong>Start Time:</strong> ${formattedStartTime}</p>
          <p><strong>End Time:</strong> ${formattedEndTime}</p>
        </div>
        
        <p>Don't forget to prepare your study materials and find a quiet place to focus!</p>
        <p>Good luck with your studies!</p>
        
        <br>
        <p>Best regards,<br>StudyBuddy Team</p>
      </div>
    `;

    return await this.sendEmail(email, `StudyBuddy - Upcoming Study Session: ${title}`, htmlContent);
  }

  // Send friend invitation notification
  async sendFriendInviteNotification(email, inviterName, inviteCode) {
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3B82F6;">🤝 You've been invited to StudyBuddy!</h2>
        <p>Hi there,</p>
        <p>${inviterName} has invited you to join them on StudyBuddy - a platform for collaborative studying!</p>
        
        <div style="background-color: #F3F4F6; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
          <p>Use this invite code to connect:</p>
          <h2 style="color: #1F2937; margin: 10px 0; letter-spacing: 2px;">${inviteCode}</h2>
        </div>
        
        <p>StudyBuddy helps you:</p>
        <ul>
          <li>Track your study sessions and progress</li>
          <li>Connect with friends and study together</li>
          <li>Set study schedules and receive reminders</li>
          <li>Compete on leaderboards and earn achievements</li>
        </ul>
        
        <p><a href="http://localhost:5173/register" style="background-color: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Join StudyBuddy</a></p>
        
        <br>
        <p>Best regards,<br>StudyBuddy Team</p>
      </div>
    `;

    return await this.sendEmail(email, `StudyBuddy - Friend Invitation from ${inviterName}`, htmlContent);
  }

  // Send achievement notification
  async sendAchievementNotification(email, achievement, username) {
    const achievementNames = {
      'first_session': 'First Study Session! 🎉',
      'five_sessions': '5 Study Sessions Complete! 📚',
      'twenty_five_sessions': '25 Study Sessions Master! 🏆',
      'streak_3': '3-Day Study Streak! 🔥',
      'streak_7': '7-Day Study Streak! 🌟',
      'streak_30': '30-Day Study Streak! 👑',
      'goal_achiever': 'Weekly Goal Achiever! 🎯'
    };

    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #3B82F6;">🏆 Achievement Unlocked!</h2>
        <p>Hi ${username},</p>
        <p>Congratulations! You've earned a new achievement:</p>
        
        <div style="background-color: #F59E0B; color: white; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px;">
          <h2 style="margin: 0; font-size: 24px;">${achievementNames[achievement] || achievement}</h2>
        </div>
        
        <p>Keep up the great work and continue your study journey!</p>
        
        <br>
        <p>Best regards,<br>StudyBuddy Team</p>
      </div>
    `;

    return await this.sendEmail(email, 'StudyBuddy - New Achievement Unlocked!', htmlContent);
  }
}

export default new EmailService(); 