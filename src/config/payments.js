const paymentConfig = {
  fawry: {
    merchantCode: process.env.FAWRY_MERCHANT_CODE,
    securityKey: process.env.FAWRY_SECURITY_KEY,
    baseUrl: process.env.NODE_ENV === 'production' 
      ? 'https://www.atfawry.com/ECommerceWeb/Fawry'
      : 'https://atfawry.fawrystaging.com/ECommerceWeb/Fawry',
    callbackUrl: process.env.BASE_URL + '/api/payments/fawry/callback',
    returnUrl: process.env.FRONTEND_URL + '/payment/success'
  },
  
  vodafoneCash: {
    username: process.env.VODAFONE_CASH_USERNAME,
    password: process.env.VODAFONE_CASH_PASSWORD,
    baseUrl: process.env.NODE_ENV === 'production'
      ? 'https://api.vodafone.com.eg/payment'
      : 'https://api-sandbox.vodafone.com.eg/payment',
    callbackUrl: process.env.BASE_URL + '/api/payments/vodafone/callback'
  },
  
  orangeMoney: {
    apiKey: process.env.ORANGE_MONEY_API_KEY,
    secretKey: process.env.ORANGE_MONEY_SECRET_KEY,
    baseUrl: process.env.NODE_ENV === 'production'
      ? 'https://api.orange.eg/payment'
      : 'https://api-sandbox.orange.eg/payment',
    callbackUrl: process.env.BASE_URL + '/api/payments/orange/callback'
  },
  
  instapay: {
    merchantId: process.env.INSTAPAY_MERCHANT_ID,
    terminalId: process.env.INSTAPAY_TERMINAL_ID,
    secretKey: process.env.INSTAPAY_SECRET_KEY,
    baseUrl: process.env.NODE_ENV === 'production'
      ? 'https://api.instapay.com.eg'
      : 'https://api-sandbox.instapay.com.eg',
    callbackUrl: process.env.BASE_URL + '/api/payments/instapay/callback'
  },
  
  creditCard: {
    // Paymob configuration for credit card processing
    apiKey: process.env.PAYMOB_API_KEY,
    integrationId: process.env.PAYMOB_INTEGRATION_ID,
    baseUrl: process.env.NODE_ENV === 'production'
      ? 'https://accept.paymob.com/api'
      : 'https://accept-sandbox.paymob.com/api',
    callbackUrl: process.env.BASE_URL + '/api/payments/paymob/callback'
  }
};

module.exports = paymentConfig;