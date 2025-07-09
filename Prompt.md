# Egyptian Digital Products Store - Backend Development Prompt v1.0

## Project Overview
Build a complete Node.js backend for a digital products store targeting the Egyptian market with advanced user management, dynamic product listings, multiple payment methods, and automated notifications.

## Technology Stack
- **Runtime**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT with refresh tokens
- **File Storage**: Cloudinary for assets and secure file delivery
- **Payment Processing**: Integration with Egyptian payment gateways (Fawry, Vodafone Cash, etc.)
- **Notifications**: Email (Nodemailer) and WhatsApp (Twilio/WhatsApp Business API)
- **Validation**: Joi for request validation
- **Security**: Helmet, rate limiting, CORS
- **Testing**: Jest for unit/integration tests

## Core Architecture

### 1. Project Structure
```
src/
├── models/
│   ├── User.js
│   ├── Role.js
│   ├── Permission.js
│   ├── Product.js
│   ├── Order.js
│   ├── Payment.js
│   ├── DigitalAsset.js
│   ├── DownloadLink.js
│   └── Notification.js
├── controllers/
│   ├── authController.js
│   ├── userController.js
│   ├── productController.js
│   ├── orderController.js
│   ├── paymentController.js
│   ├── downloadController.js
│   └── notificationController.js
├── middleware/
│   ├── auth.js
│   ├── permissions.js
│   ├── validation.js
│   └── errorHandler.js
├── routes/
│   ├── auth.js
│   ├── users.js
│   ├── products.js
│   ├── orders.js
│   ├── payments.js
│   └── downloads.js
├── services/
│   ├── authService.js
│   ├── permissionService.js
│   ├── paymentService.js
│   ├── cloudinaryService.js
│   ├── emailService.js
│   └── whatsappService.js
├── utils/
│   ├── encryption.js
│   ├── tokenizer.js
│   └── validators.js
├── config/
│   ├── database.js
│   ├── cloudinary.js
│   └── payments.js
└── app.js
```

## 2. Database Models (MongoDB/Mongoose)

### User Model
```javascript
{
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  roles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Role' }],
  permissions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Permission' }],
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
  refreshToken: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

### Role Model (Dynamic)
```javascript
{
  name: { type: String, required: true, unique: true },
  description: { type: String },
  permissions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Permission' }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
}
```

### Permission Model
```javascript
{
  name: { type: String, required: true },
  resource: { type: String, required: true }, // 'products', 'users', 'orders', etc.
  action: { type: String, required: true }, // 'create', 'read', 'update', 'delete'
  conditions: {
    ownOnly: { type: Boolean, default: false },
    status: [{ type: String }],
    custom: { type: mongoose.Schema.Types.Mixed }
  },
  description: { type: String },
  isActive: { type: Boolean, default: true }
}
```

### Product Model (Dynamic Attributes)
```javascript
{
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  currency: { type: String, default: 'EGP' },
  category: { type: String, required: true },
  tags: [{ type: String }],
  attributes: {
    type: Map,
    of: mongoose.Schema.Types.Mixed
  },
  files: [{
    name: { type: String },
    cloudinaryId: { type: String },
    url: { type: String },
    size: { type: Number },
    mimeType: { type: String }
  }],
  thumbnails: [{
    url: { type: String },
    cloudinaryId: { type: String }
  }],
  isActive: { type: Boolean, default: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

### Order Model
```javascript
{
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  products: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    quantity: { type: Number, default: 1 },
    price: { type: Number, required: true }
  }],
  totalAmount: { type: Number, required: true },
  currency: { type: String, default: 'EGP' },
  status: { 
    type: String, 
    enum: ['pending', 'processing', 'completed', 'cancelled', 'refunded'],
    default: 'pending'
  },
  paymentMethod: { type: String, required: true },
  paymentData: { type: mongoose.Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

### Payment Model
```javascript
{
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'EGP' },
  paymentMethod: { type: String, required: true },
  gatewayReference: { type: String },
  status: { 
    type: String, 
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  metadata: { type: mongoose.Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}
```

### Download Link Model
```javascript
{
  order: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  token: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true },
  downloadCount: { type: Number, default: 0 },
  maxDownloads: { type: Number, default: 5 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
}
```

## 3. Core Features Implementation

### Authentication System
- JWT-based authentication with refresh tokens
- Password hashing with bcrypt
- Login attempt rate limiting
- Session management with Redis (optional for scalability)

### Dynamic Permission System
```javascript
// Permission check middleware
const checkPermission = (resource, action) => {
  return async (req, res, next) => {
    const userId = req.user.id;
    const hasPermission = await permissionService.checkUserPermission(userId, resource, action);
    if (!hasPermission) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};
```

### Advanced Product Listing
- Dynamic filtering by attributes
- Search functionality with MongoDB text search
- Pagination with cursor-based pagination
- Sorting by multiple fields
- Category-based filtering
- Price range filtering

### Egyptian Payment Methods Integration
- **Fawry API**: Most popular payment method in Egypt
- **Vodafone Cash**: Mobile wallet integration
- **Orange Money**: Mobile wallet integration
- **Instapay**: Bank transfer system
- **Credit/Debit Cards**: Through payment gateway
- **Bank Transfer**: Manual verification system

### File Management with Cloudinary
- Upload files to Cloudinary with transformation
- Generate secure download URLs with expiration
- Thumbnail generation for images
- File encryption for sensitive content
- Download tracking and limits

### Notification System
- **Email**: Order confirmation, download links, payment status
- **WhatsApp**: Order updates, payment confirmations
- Template-based messaging
- Async processing with queue system

## 4. API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/forgot-password` - Password reset
- `POST /api/auth/reset-password` - Complete password reset

### User Management
- `GET /api/users` - List users (with permissions)
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `POST /api/users/:id/roles` - Assign roles
- `DELETE /api/users/:id/roles/:roleId` - Remove role
- `GET /api/users/:id/permissions` - Get user permissions

### Role & Permission Management
- `GET /api/roles` - List all roles
- `POST /api/roles` - Create new role
- `PUT /api/roles/:id` - Update role
- `DELETE /api/roles/:id` - Delete role
- `GET /api/permissions` - List all permissions
- `POST /api/permissions` - Create new permission

### Product Management
- `GET /api/products` - List products (with advanced filtering)
- `POST /api/products` - Create new product
- `GET /api/products/:id` - Get product by ID
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `POST /api/products/:id/upload` - Upload product files

### Order Management
- `POST /api/orders` - Create new order
- `GET /api/orders` - List user orders
- `GET /api/orders/:id` - Get order details
- `PUT /api/orders/:id/status` - Update order status
- `POST /api/orders/:id/refund` - Request refund

### Payment Processing
- `POST /api/payments/process` - Process payment
- `GET /api/payments/methods` - List available payment methods
- `POST /api/payments/webhook` - Payment gateway webhooks
- `GET /api/payments/:id/status` - Get payment status

### Download Management
- `GET /api/downloads/:token` - Download file by token
- `POST /api/downloads/generate` - Generate download link
- `GET /api/downloads/history` - User download history

## 5. Security Implementation

### Authentication Security
- JWT with short expiration (15 minutes)
- Refresh token rotation
- Rate limiting on login attempts
- IP-based blocking for suspicious activity

### Data Protection
- Input validation with Joi
- SQL injection prevention (MongoDB native protection)
- XSS protection with helmet
- CORS configuration
- API rate limiting

### File Security
- Secure file upload with type validation
- Virus scanning (optional with ClamAV)
- Encrypted file storage
- Temporary download URLs
- Download attempt logging

## 6. Environment Configuration

### Required Environment Variables
```
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/digital-store
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
FAWRY_MERCHANT_CODE=your-merchant-code
FAWRY_SECURITY_KEY=your-security-key
VODAFONE_CASH_USERNAME=your-username
VODAFONE_CASH_PASSWORD=your-password
EMAIL_SERVICE=gmail
EMAIL_USER=your-email
EMAIL_PASS=your-password
WHATSAPP_TOKEN=your-whatsapp-token
WHATSAPP_PHONE_NUMBER_ID=your-phone-id
ENCRYPTION_KEY=your-encryption-key
```

## 7. Testing Strategy

### Test Structure
- Unit tests for services and utilities
- Integration tests for API endpoints
- Database tests with test database
- Payment gateway mocking
- File upload/download testing

### Test Coverage
- Authentication flow testing
- Permission system testing
- Product CRUD operations
- Order processing workflow
- Payment gateway integration
- Download link generation and validation

## 8. Deployment Considerations

### Production Requirements
- PM2 for process management
- MongoDB Atlas or self-hosted MongoDB
- Redis for session management (optional)
- Cloudinary for CDN and file storage
- SSL certificate for HTTPS
- Environment-specific configurations

### Performance Optimization
- Database indexing for frequently queried fields
- Caching with Redis for frequently accessed data
- Image optimization with Cloudinary
- Pagination for large datasets
- Async processing for notifications

## 9. API Documentation

### Documentation Tools
- Swagger/OpenAPI documentation
- Postman collection for testing
- Example requests and responses
- Authentication flow examples

## 10. Monitoring and Logging

### Logging Strategy
- Winston for structured logging
- Request/response logging
- Error tracking with Sentry (optional)
- Performance monitoring
- Payment transaction logging

## Implementation Priority

### Phase 1 (Core Features)
1. User authentication and basic user management
2. Basic product CRUD operations
3. Simple order processing
4. Basic file upload/download

### Phase 2 (Advanced Features)
1. Dynamic role and permission system
2. Advanced product filtering and search
3. Payment gateway integration
4. Email notifications

### Phase 3 (Enhanced Features)
1. WhatsApp notifications
2. Advanced analytics
3. Refund processing
4. Advanced security features

## Success Metrics

- User registration and authentication flow
- Product creation and management
- Order processing with payment
- File download with security
- Notification delivery (email/WhatsApp)
- Permission system working correctly
- API response times under 500ms
- 99.9% uptime for critical operations

## Additional Considerations

### Localization
- Arabic language support for user-facing content
- Egyptian currency (EGP) handling
- Local date/time formatting
- Egyptian phone number validation

### Compliance
- GDPR compliance for data handling
- Egyptian e-commerce regulations
- Payment industry security standards
- Tax calculation for Egyptian market

This comprehensive prompt should guide the development of a robust, scalable backend for your Egyptian digital products store with all the requested features implemented using Node.js, MongoDB, and Cloudinary.