/**
 * Email Service - Handles all email communications
 * Enterprise: Template-based emails with tracking
 */

const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initTransporter();
  }

  /**
   * Initialize email transporter
   */
  initTransporter() {
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT || 587,
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        },
        tls: {
          rejectUnauthorized: false
        }
      });

      this.transporter.verify((error) => {
        if (error) {
          logger.error('Email transporter verification failed:', error);
        } else {
          logger.info('Email transporter ready');
        }
      });
    } else {
      logger.warn('SMTP not configured. Email functionality disabled.');
    }
  }

  /**
   * Send email
   */
  async sendEmail(to, subject, html, text = null) {
    if (!this.transporter) {
      logger.error('Email transporter not initialized');
      throw new Error('Email service not configured');
    }

    try {
      const mailOptions = {
        from: process.env.SMTP_FROM || 'noreply@crimelens.com',
        to,
        subject,
        html,
        text: text || html.replace(/<[^>]*>/g, '')
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info(`Email sent to ${to}: ${info.messageId}`);
      return info;
    } catch (error) {
      logger.error('Failed to send email:', error);
      throw error;
    }
  }

  /**
   * Send verification email
   */
  async sendVerificationEmail(email, token) {
    const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #1a237e; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f5f5f5; }
            .button { 
              display: inline-block; 
              padding: 12px 24px; 
              background: #1a237e; 
              color: white !important; 
              text-decoration: none; 
              border-radius: 4px;
              margin: 20px 0;
            }
            .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>CrimeLens</h1>
              <p>AI Powered Crime Intelligence Platform</p>
            </div>
            <div class="content">
              <h2>Welcome to CrimeLens!</h2>
              <p>Thank you for registering. Please verify your email address to get started.</p>
              <p style="text-align: center;">
                <a href="${verificationLink}" class="button">Verify Email Address</a>
              </p>
              <p>Or copy and paste this link in your browser:</p>
              <p style="word-break: break-all; background: #e8e8e8; padding: 10px; border-radius: 4px;">
                ${verificationLink}
              </p>
              <p>This link will expire in 24 hours.</p>
              <p>If you didn't create an account, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} CrimeLens. All rights reserved.</p>
              <p>Karnataka State Police</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail(email, 'Verify Your CrimeLens Account', html);
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email, token) {
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #d32f2f; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f5f5f5; }
            .button { 
              display: inline-block; 
              padding: 12px 24px; 
              background: #d32f2f; 
              color: white !important; 
              text-decoration: none; 
              border-radius: 4px;
              margin: 20px 0;
            }
            .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>CrimeLens</h1>
              <p>Password Reset Request</p>
            </div>
            <div class="content">
              <h2>Reset Your Password</h2>
              <p>We received a request to reset your CrimeLens account password.</p>
              <p style="text-align: center;">
                <a href="${resetLink}" class="button">Reset Password</a>
              </p>
              <p>Or copy and paste this link in your browser:</p>
              <p style="word-break: break-all; background: #e8e8e8; padding: 10px; border-radius: 4px;">
                ${resetLink}
              </p>
              <p>This link will expire in 10 minutes.</p>
              <p>If you didn't request a password reset, please ignore this email or contact support.</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} CrimeLens. All rights reserved.</p>
              <p>Karnataka State Police</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail(email, 'CrimeLens Password Reset', html);
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(email, name) {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #1a237e; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; background: #f5f5f5; }
            .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>CrimeLens</h1>
              <p>Welcome to the Future of Policing</p>
            </div>
            <div class="content">
              <h2>Welcome, ${name}!</h2>
              <p>Your account has been successfully verified. You now have full access to CrimeLens.</p>
              <h3>Getting Started</h3>
              <ul>
                <li>📊 Explore the Crime Dashboard</li>
                <li>🗺️ View Crime Heatmaps</li>
                <li>🔗 Analyze Criminal Networks</li>
                <li>🤖 Get AI-Powered Insights</li>
              </ul>
              <p>Log in to start exploring: <a href="${process.env.FRONTEND_URL}/login">Login to CrimeLens</a></p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} CrimeLens. All rights reserved.</p>
              <p>Karnataka State Police</p>
            </div>
          </div>
        </body>
      </html>
    `;

    return this.sendEmail(email, 'Welcome to CrimeLens', html);
  }
}

// Export singleton instance
module.exports = new EmailService();