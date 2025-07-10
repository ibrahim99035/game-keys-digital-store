const Permission = require('../models/Permission');

const checkPermission = (resource, action) => {
  return async (req, res, next) => {
    try {
      const user = req.user;
      
      if (!user) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Check if user has specific permission
      const hasPermission = await hasUserPermission(user, resource, action, req);
      
      if (!hasPermission) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      next();
    } catch (error) {
      res.status(500).json({ error: 'Permission check failed' });
    }
  };
};

const hasUserPermission = async (user, resource, action, req = null) => {
  try {
    // Get all user permissions (direct + role-based)
    const userPermissions = [...user.permissions];
    
    // Add permissions from roles
    for (const role of user.roles) {
      if (role.permissions) {
        userPermissions.push(...role.permissions);
      }
    }

    // Check for exact permission match
    const permission = userPermissions.find(p => 
      p.resource === resource && 
      (p.action === action || p.action === 'manage')
    );

    if (!permission) {
      return false;
    }

    // Check conditions
    if (permission.conditions) {
      // Check if user can only access own resources
      if (permission.conditions.ownOnly && req) {
        const resourceId = req.params.id;
        if (resourceId && resourceId !== user._id.toString()) {
          // Additional check for related resources
          if (resource === 'orders' && req.order && req.order.user.toString() !== user._id.toString()) {
            return false;
          }
          if (resource === 'products' && req.product && req.product.createdBy.toString() !== user._id.toString()) {
            return false;
          }
        }
      }

      // Check status conditions
      if (permission.conditions.status && permission.conditions.status.length > 0) {
        const resourceStatus = req.body.status || req.query.status;
        if (resourceStatus && !permission.conditions.status.includes(resourceStatus)) {
          return false;
        }
      }
    }

    return true;
  } catch (error) {
    console.error('Permission check error:', error);
    return false;
  }
};

module.exports = { checkPermission, hasUserPermission };