const notificationConfig = {
  email: {
    service: process.env.EMAIL_SERVICE || 'gmail',
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    },
    from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
    templates: {
      orderCreated: 'order-created',
      paymentCompleted: 'payment-completed',
      paymentFailed: 'payment-failed',
      downloadReady: 'download-ready',
      orderCancelled: 'order-cancelled',
      passwordReset: 'password-reset',
      welcome: 'welcome'
    }
  },
  
  whatsapp: {
    token: process.env.WHATSAPP_TOKEN,
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
    baseUrl: 'https://graph.facebook.com/v18.0',
    webhookVerifyToken: process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN,
    templates: {
      orderCreated: 'order_created_template',
      paymentCompleted: 'payment_completed_template',
      downloadReady: 'download_ready_template'
    }
  },
  
  sms: {
    // Twilio configuration for SMS
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    fromNumber: process.env.TWILIO_FROM_NUMBER,
    baseUrl: 'https://api.twilio.com/2010-04-01'
  }
};

module.exports = notificationConfig;