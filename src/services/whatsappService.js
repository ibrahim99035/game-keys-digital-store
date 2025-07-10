const axios = require('axios');
const notificationConfig = require('../config/notifications');

class WhatsAppService {
  constructor() {
    this.token = notificationConfig.whatsapp.token;
    this.phoneNumberId = notificationConfig.whatsapp.phoneNumberId;
    this.baseUrl = notificationConfig.whatsapp.baseUrl;
    this.templates = notificationConfig.whatsapp.templates;
  }

  // Send WhatsApp message
  async sendMessage(to, message, type = 'text') {
    try {
      const url = `${this.baseUrl}/${this.phoneNumberId}/messages`;
      
      const payload = {
        messaging_product: 'whatsapp',
        to: to,
        type: type,
        [type]: message
      };

      const response = await axios.post(url, payload, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        messageId: response.data.messages[0].id,
        status: response.data.messages[0].message_status
      };
    } catch (error) {
      throw new Error(`WhatsApp message failed: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  // Send template message
  async sendTemplateMessage(to, templateName, templateData = {}) {
    try {
      const url = `${this.baseUrl}/${this.phoneNumberId}/messages`;
      
      const payload = {
        messaging_product: 'whatsapp',
        to: to,
        type: 'template',
        template: {
          name: templateName,
          language: {
            code: templateData.language || 'en'
          },
          components: this.buildTemplateComponents(templateData)
        }
      };

      const response = await axios.post(url, payload, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      });

      return {
        success: true,
        messageId: response.data.messages[0].id,
        status: response.data.messages[0].message_status
      };
    } catch (error) {
      throw new Error(`WhatsApp template message failed: ${error.response?.data?.error?.message || error.message}`);
    }
  }

  // Build template components
  buildTemplateComponents(templateData) {
    const components = [];

    // Header parameters
    if (templateData.headerParams) {
      components.push({
        type: 'header',
        parameters: templateData.headerParams.map(param => ({
          type: 'text',
          text: param
        }))
      });
    }

    // Body parameters
    if (templateData.bodyParams) {
      components.push({
        type: 'body',
        parameters: templateData.bodyParams.map(param => ({
          type: 'text',
          text: param
        }))
      });
    }

    // Button parameters
    if (templateData.buttonParams) {
      components.push({
        type: 'button',
        sub_type: 'url',
        index: 0,
        parameters: [{
          type: 'text',
          text: templateData.buttonParams.url
        }]
      });
    }

    return components;
  }

  // Send order confirmation via WhatsApp
  async sendOrderConfirmation(orderData) {
    const templateName = this.templates.orderCreated;
    const templateData = {
      language: orderData.language === 'ar' ? 'ar' : 'en',
      bodyParams: [
        orderData.customerName,
        orderData.orderNumber,
        `${orderData.totalAmount} ${orderData.currency}`
      ],
      buttonParams: {
        url: orderData.orderNumber // This will be appended to the template URL
      }
    };

    return await this.sendTemplateMessage(orderData.customerPhone, templateName, templateData);
  }

  // Send payment confirmation via WhatsApp
  async sendPaymentConfirmation(orderData, paymentData) {
    const templateName = this.templates.paymentCompleted;
    const templateData = {
      language: orderData.language === 'ar' ? 'ar' : 'en',
      bodyParams: [
        orderData.customerName,
        orderData.orderNumber,
        `${paymentData.amount} ${paymentData.currency}`,
        paymentData.transactionId
      ],
      buttonParams: {
        url: orderData.orderNumber
      }
    };

    return await this.sendTemplateMessage(orderData.customerPhone, templateName, templateData);
  }

  // Send download ready notification via WhatsApp
  async sendDownloadReady(orderData, downloadLinks) {
    const templateName = this.templates.downloadReady;
    const templateData = {
      language: orderData.language === 'ar' ? 'ar' : 'en',
      bodyParams: [
        orderData.customerName,
        orderData.orderNumber,
        downloadLinks.length.toString()
      ],
      buttonParams: {
        url: orderData.orderNumber
      }
    };

    return await this.sendTemplateMessage(orderData.customerPhone, templateName, templateData);
  }

  // Send text message
  async sendTextMessage(to, text) {
    const message = {
      text: text
    };

    return await this.sendMessage(to, message, 'text');
  }

  // Send document
  async sendDocument(to, documentUrl, caption = '') {
    const message = {
      link: documentUrl,
      caption: caption
    };

    return await this.sendMessage(to, message, 'document');
  }

  // Handle webhook
  async handleWebhook(webhookData) {
    try {
      // Process incoming webhook data
      const { entry } = webhookData;
      
      for (const entryItem of entry) {
        const { changes } = entryItem;
        
        for (const change of changes) {
          if (change.field === 'messages') {
            const { messages, statuses } = change.value;
            
            // Handle incoming messages
            if (messages) {
              for (const message of messages) {
                await this.processIncomingMessage(message);
              }
            }
            
            // Handle message status updates
            if (statuses) {
              for (const status of statuses) {
                await this.processMessageStatus(status);
              }
            }
          }
        }
      }

      return { success: true };
    } catch (error) {
      throw new Error(`Webhook processing failed: ${error.message}`);
    }
  }

  // Process incoming message
  async processIncomingMessage(message) {
    // Log incoming message
    console.log('Incoming WhatsApp message:', {
      from: message.from,
      id: message.id,
      type: message.type,
      timestamp: message.timestamp
    });

    // You can implement auto-response logic here
    // For example, respond to specific keywords or commands
  }

  // Process message status
  async processMessageStatus(status) {
    // Log message status update
    console.log('WhatsApp message status:', {
      id: status.id,
      status: status.status,
      timestamp: status.timestamp,
      recipientId: status.recipient_id
    });

    // Update message status in database if needed
  }

  // Verify webhook
  verifyWebhook(mode, token, challenge) {
    const verifyToken = notificationConfig.whatsapp.webhookVerifyToken;
    
    if (mode === 'subscribe' && token === verifyToken) {
      return challenge;
    }
    
    throw new Error('Webhook verification failed');
  }
}

module.exports = new WhatsAppService();