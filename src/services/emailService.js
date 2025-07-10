const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const path = require('path');
const handlebars = require('handlebars');
const notificationConfig = require('../config/notifications');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransporter({
      service: notificationConfig.email.service,
      host: notificationConfig.email.host,
      port: notificationConfig.email.port,
      secure: notificationConfig.email.secure,
      auth: notificationConfig.email.auth
    });

    // Verify transporter configuration
    this.transporter.verify((error, success) => {
      if (error) {
        console.error('Email service configuration error:', error);
      } else {
        console.log('Email service ready');
      }
    });
  }

  // Send email
  async sendEmail(to, subject, html, attachments = []) {
    try {
      const mailOptions = {
        from: notificationConfig.email.from,
        to: Array.isArray(to) ? to.join(', ') : to,
        subject: subject,
        html: html,
        attachments: attachments
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      return {
        success: true,
        messageId: result.messageId,
        response: result.response
      };
    } catch (error) {
      throw new Error(`Email sending failed: ${error.message}`);
    }
  }

  // Send email using template
  async sendEmailTemplate(to, templateName, data, attachments = []) {
    try {
      const template = await this.getEmailTemplate(templateName);
      const html = template(data);
      const subject = this.getSubjectForTemplate(templateName, data);

      return await this.sendEmail(to, subject, html, attachments);
    } catch (error) {
      throw new Error(`Template email sending failed: ${error.message}`);
    }
  }

  // Get email template
  async getEmailTemplate(templateName) {
    try {
      const templatePath = path.join(__dirname, '..', 'templates', 'email', `${templateName}.hbs`);
      const templateContent = await fs.readFile(templatePath, 'utf-8');
      return handlebars.compile(templateContent);
    } catch (error) {
      throw new Error(`Template not found: ${templateName}`);
    }
  }

  // Get subject for template
  getSubjectForTemplate(templateName, data) {
    const subjects = {
      'order-created': `Order Confirmation - ${data.orderNumber}`,
      'order-created-ar': `تأكيد الطلب - ${data.orderNumber}`,
      'payment-completed': `Payment Successful - ${data.orderNumber}`,
      'payment-completed-ar': `تم الدفع بنجاح - ${data.orderNumber}`,
      'payment-failed': `Payment Failed - ${data.orderNumber}`,
      'payment-failed-ar': `فشل الدفع - ${data.orderNumber}`,
      'download-ready': `Your Download is Ready - ${data.orderNumber}`,
      'download-ready-ar': `تحميلك جاهز - ${data.orderNumber}`,
      'order-cancelled': `Order Cancelled - ${data.orderNumber}`,
      'order-cancelled-ar': `تم إلغاء الطلب - ${data.orderNumber}`,
      'password-reset': 'Password Reset Request',
      'password-reset-ar': 'طلب إعادة تعيين كلمة المرور',
      'welcome': 'Welcome to Egyptian Digital Store',
      'welcome-ar': 'مرحباً بك في المتجر الرقمي المصري'
    };

    return subjects[templateName] || 'Egyptian Digital Store Notification';
  }

  // Send order confirmation email
  async sendOrderConfirmation(orderData) {
    const templateName = orderData.language === 'ar' ? 'order-created-ar' : 'order-created';
    
    const emailData = {
      customerName: orderData.customerName,
      orderNumber: orderData.orderNumber,
      orderDate: orderData.orderDate,
      items: orderData.items,
      totalAmount: orderData.totalAmount,
      currency: orderData.currency,
      paymentMethod: orderData.paymentMethod,
      orderUrl: `${process.env.FRONTEND_URL}/orders/${orderData.orderNumber}`
    };

    return await this.sendEmailTemplate(orderData.customerEmail, templateName, emailData);
  }

  // Send payment confirmation email
  async sendPaymentConfirmation(orderData, paymentData) {
    const templateName = orderData.language === 'ar' ? 'payment-completed-ar' : 'payment-completed';
    
    const emailData = {
      customerName: orderData.customerName,
      orderNumber: orderData.orderNumber,
      paymentAmount: paymentData.amount,
      currency: paymentData.currency,
      paymentMethod: paymentData.paymentMethod,
      paymentDate: paymentData.paymentDate,
      transactionId: paymentData.transactionId,
      orderUrl: `${process.env.FRONTEND_URL}/orders/${orderData.orderNumber}`
    };

    return await this.sendEmailTemplate(orderData.customerEmail, templateName, emailData);
  }

  // Send download ready email
  async sendDownloadReady(orderData, downloadLinks) {
    const templateName = orderData.language === 'ar' ? 'download-ready-ar' : 'download-ready';
    
    const emailData = {
      customerName: orderData.customerName,
      orderNumber: orderData.orderNumber,
      downloadLinks: downloadLinks.map(link => ({
        productName: link.productName,
        downloadUrl: link.downloadUrl,
        expiresAt: link.expiresAt,
        downloadsRemaining: link.downloadsRemaining
      })),
      orderUrl: `${process.env.FRONTEND_URL}/orders/${orderData.orderNumber}`
    };

    return await this.sendEmailTemplate(orderData.customerEmail, templateName, emailData);
  }

  // Send password reset email
  async sendPasswordReset(email, resetToken, language = 'en') {
    const templateName = language === 'ar' ? 'password-reset-ar' : 'password-reset';
    
    const emailData = {
      resetUrl: `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`,
      resetToken: resetToken,
      expiresIn: '1 hour'
    };

    return await this.sendEmailTemplate(email, templateName, emailData);
  }

  // Send welcome email
  async sendWelcomeEmail(userData) {
    const templateName = userData.language === 'ar' ? 'welcome-ar' : 'welcome';
    
    const emailData = {
      customerName: userData.firstName,
      email: userData.email,
      loginUrl: `${process.env.FRONTEND_URL}/login`,
      profileUrl: `${process.env.FRONTEND_URL}/profile`,
      supportEmail: process.env.SUPPORT_EMAIL || 'support@egyptianstore.com'
    };

    return await this.sendEmailTemplate(userData.email, templateName, emailData);
  }

  // Send bulk emails
  async sendBulkEmails(recipients, subject, html, attachments = []) {
    const emailPromises = recipients.map(recipient => 
      this.sendEmail(recipient, subject, html, attachments)
    );

    try {
      const results = await Promise.allSettled(emailPromises);
      
      const successful = results.filter(result => result.status === 'fulfilled').length;
      const failed = results.filter(result => result.status === 'rejected').length;

      return {
        success: true,
        totalSent: successful,
        totalFailed: failed,
        results: results
      };
    } catch (error) {
      throw new Error(`Bulk email sending failed: ${error.message}`);
    }
  }
}

module.exports = new EmailService();