const Permission = require('../models/Permission');
const Role = require('../models/Role');

/**
 * Usage: permissions(['product:read', 'order:create'])
 */
module.exports = (requiredPermissions = []) => {
  return async (req, res, next) => {
    try {
      const user = req.user;
      if (!user) return res.status(401).json({ error: 'Unauthorized' });

      // Gather user permissions from roles and direct assignments
      const roles = await Role.find({ _id: { $in: user.roles } }).populate('permissions');
      const rolePermissions = roles.flatMap(role => role.permissions.map(p => `${p.resource}:${p.action}`));
      const userPermissions = user.permissions || [];
      const directPermissions = await Permission.find({ _id: { $in: userPermissions } });
      const directPermissionNames = directPermissions.map(p => `${p.resource}:${p.action}`);

      const allPermissions = new Set([...rolePermissions, ...directPermissionNames]);

      // Check if user has all required permissions
      const hasAll = requiredPermissions.every(p => allPermissions.has(p));
      if (!hasAll) return res.status(403).json({ error: 'Forbidden: insufficient permissions' });

      next();
    } catch (err) {
      next(err);
    }
  };
};