const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { createSecureToken } = require('../utils/tokenizer');

class AuthService {
  
  // Generate JWT tokens
  generateTokens(user) {
    const payload = {
      id: user._id,
      email: user.email,
      roles: user.roles,
      permissions: user.permissions
    };

    const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '15m',
      issuer: 'egyptian-store',
      audience: 'egyptian-store-users'
    });

    const refreshToken = jwt.sign(
      { id: user._id, tokenVersion: user.tokenVersion || 0 },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    return { accessToken, refreshToken };
  }

  // Hash password
  async hashPassword(password) {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  // Compare password
  async comparePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }

  // Register new user
  async register(userData) {
    const { email, password, firstName, lastName, phone } = userData;

    // Check if user already exists
    const existingUser = await User.findOne({ 
      $or: [{ email }, { phone }] 
    });

    if (existingUser) {
      throw new Error(
        existingUser.email === email ? 
        'Email already registered' : 
        'Phone number already registered'
      );
    }

    // Hash password
    const hashedPassword = await this.hashPassword(password);

    // Create user
    const user = new User({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone,
      roles: [], // Will be populated by default role assignment
      permissions: []
    });

    await user.save();

    // Generate tokens
    const tokens = this.generateTokens(user);

    // Save refresh token
    user.refreshToken = tokens.refreshToken;
    await user.save();

    return {
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        roles: user.roles,
        permissions: user.permissions
      },
      tokens
    };
  }

  // Login user
  async login(email, password, ipAddress) {
    // Find user
    const user = await User.findOne({ email })
      .populate('roles')
      .populate('permissions');

    if (!user || !user.isActive) {
      throw new Error('Invalid credentials');
    }

    // Check password
    const isPasswordValid = await this.comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    // Update last login
    user.lastLogin = new Date();
    user.lastLoginIp = ipAddress;

    // Generate new tokens
    const tokens = this.generateTokens(user);

    // Save refresh token
    user.refreshToken = tokens.refreshToken;
    await user.save();

    return {
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        roles: user.roles,
        permissions: user.permissions,
        lastLogin: user.lastLogin
      },
      tokens
    };
  }

  // Refresh access token
  async refreshToken(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      
      const user = await User.findById(decoded.id)
        .populate('roles')
        .populate('permissions');

      if (!user || !user.isActive || user.refreshToken !== refreshToken) {
        throw new Error('Invalid refresh token');
      }

      // Generate new tokens
      const tokens = this.generateTokens(user);

      // Save new refresh token
      user.refreshToken = tokens.refreshToken;
      await user.save();

      return {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          roles: user.roles,
          permissions: user.permissions
        },
        tokens
      };
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  // Logout user
  async logout(userId) {
    const user = await User.findById(userId);
    if (user) {
      user.refreshToken = null;
      await user.save();
    }
  }

  // Generate password reset token
  async generatePasswordResetToken(email) {
    const user = await User.findOne({ email });
    if (!user) {
      throw new Error('User not found');
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    user.passwordResetToken = resetToken;
    user.passwordResetExpiry = resetTokenExpiry;
    await user.save();

    return resetToken;
  }

  // Reset password
  async resetPassword(token, newPassword) {
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpiry: { $gt: new Date() }
    });

    if (!user) {
      throw new Error('Invalid or expired reset token');
    }

    const hashedPassword = await this.hashPassword(newPassword);
    
    user.password = hashedPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpiry = undefined;
    user.refreshToken = null; // Force re-login
    await user.save();

    return true;
  }

  // Verify JWT token
  verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  // Generate secure download token
  generateSecureToken(payload, expiresIn = '24h') {
    return createSecureToken(payload, expiresIn);
  }
}

module.exports = new AuthService();