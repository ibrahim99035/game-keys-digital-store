const User = require('../models/User');
const Role = require('../models/Role');
const Permission = require('../models/Permission');

class PermissionService {
  
  // Check if user has specific permission
  async checkUserPermission(userId, resource, action, conditions = {}) {
    const user = await User.findById(userId)
      .populate({
        path: 'roles',
        populate: {
          path: 'permissions'
        }
      })
      .populate('permissions');

    if (!user || !user.isActive) {
      return false;
    }

    // Collect all permissions from roles and direct permissions
    const allPermissions = [...user.permissions];
    
    user.roles.forEach(role => {
      if (role.isActive) {
        allPermissions.push(...role.permissions);
      }
    });

    // Check for matching permission
    const hasPermission = allPermissions.some(permission => {
      if (!permission.isActive) return false;
      
      const resourceMatch = permission.resource === resource || permission.resource === '*';
      const actionMatch = permission.action === action || permission.action === '*';

      if (!resourceMatch || !actionMatch) return false;

      // Check conditions if they exist
      if (permission.conditions && Object.keys(permission.conditions).length > 0) {
        return this.evaluateConditions(permission.conditions, conditions, userId);
      }

      return true;
    });

    return hasPermission;
  }

  // Evaluate permission conditions
  evaluateConditions(permissionConditions, requestConditions, userId) {
    // Check if user can only access their own resources
    if (permissionConditions.ownOnly && requestConditions.ownerId !== userId) {
      return false;
    }

    // Check status conditions
    if (permissionConditions.status && 
        permissionConditions.status.length > 0 && 
        requestConditions.status &&
        !permissionConditions.status.includes(requestConditions.status)) {
      return false;
    }

    // Check custom conditions
    if (permissionConditions.custom) {
      // Implement custom condition logic here
      // This is flexible and can be extended based on business needs
      return this.evaluateCustomConditions(
        permissionConditions.custom, 
        requestConditions, 
        userId
      );
    }

    return true;
  }

  // Evaluate custom conditions (extensible)
  evaluateCustomConditions(customConditions, requestConditions, userId) {
    // Example custom condition evaluations
    if (customConditions.department && requestConditions.department) {
      return customConditions.department === requestConditions.department;
    }

    if (customConditions.maxAmount && requestConditions.amount) {
      return requestConditions.amount <= customConditions.maxAmount;
    }

    if (customConditions.timeRestriction) {
      const now = new Date();
      const currentHour = now.getHours();
      const { startHour, endHour } = customConditions.timeRestriction;
      
      if (currentHour < startHour || currentHour > endHour) {
        return false;
      }
    }

    return true;
  }

  // Get all user permissions (flattened)
  async getUserPermissions(userId) {
    const user = await User.findById(userId)
      .populate({
        path: 'roles',
        populate: {
          path: 'permissions'
        }
      })
      .populate('permissions');

    if (!user) {
      return [];
    }

    const permissions = new Map();

    // Add direct permissions
    user.permissions.forEach(permission => {
      if (permission.isActive) {
        const key = `${permission.resource}:${permission.action}`;
        permissions.set(key, permission);
      }
    });

    // Add role permissions
    user.roles.forEach(role => {
      if (role.isActive) {
        role.permissions.forEach(permission => {
          if (permission.isActive) {
            const key = `${permission.resource}:${permission.action}`;
            if (!permissions.has(key)) {
              permissions.set(key, permission);
            }
          }
        });
      }
    });

    return Array.from(permissions.values());
  }

  // Create new permission
  async createPermission(permissionData) {
    const permission = new Permission(permissionData);
    await permission.save();
    return permission;
  }

  // Create new role
  async createRole(roleData) {
    const role = new Role(roleData);
    await role.save();
    return role;
  }

  // Assign role to user
  async assignRoleToUser(userId, roleId) {
    const user = await User.findById(userId);
    const role = await Role.findById(roleId);

    if (!user || !role) {
      throw new Error('User or role not found');
    }

    if (!user.roles.includes(roleId)) {
      user.roles.push(roleId);
      await user.save();
    }

    return user;
  }

  // Remove role from user
  async removeRoleFromUser(userId, roleId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.roles = user.roles.filter(role => role.toString() !== roleId);
    await user.save();

    return user;
  }

  // Assign permission to user directly
  async assignPermissionToUser(userId, permissionId) {
    const user = await User.findById(userId);
    const permission = await Permission.findById(permissionId);

    if (!user || !permission) {
      throw new Error('User or permission not found');
    }

    if (!user.permissions.includes(permissionId)) {
      user.permissions.push(permissionId);
      await user.save();
    }

    return user;
  }

  // Remove permission from user
  async removePermissionFromUser(userId, permissionId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    user.permissions = user.permissions.filter(
      permission => permission.toString() !== permissionId
    );
    await user.save();

    return user;
  }

  // Get all roles
  async getAllRoles() {
    return await Role.find({ isActive: true }).populate('permissions');
  }

  // Get all permissions
  async getAllPermissions() {
    return await Permission.find({ isActive: true });
  }

  // Update role permissions
  async updateRolePermissions(roleId, permissionIds) {
    const role = await Role.findById(roleId);
    if (!role) {
      throw new Error('Role not found');
    }

    // Verify all permissions exist
    const permissions = await Permission.find({ _id: { $in: permissionIds } });
    if (permissions.length !== permissionIds.length) {
      throw new Error('Some permissions not found');
    }

    role.permissions = permissionIds;
    await role.save();

    return role;
  }
}

module.exports = new PermissionService();