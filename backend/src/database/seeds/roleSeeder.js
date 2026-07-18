/**
 * Role Seeder - Creates default roles for the system
 */

const Role = require('../../models/Role');
const logger = require('../../utils/logger');

const roles = [
  {
    name: 'admin',
    displayName: 'System Administrator',
    description: 'Full system access with all permissions',
    level: 10,
    permissions: [
      { resource: 'crimes', actions: ['create', 'read', 'update', 'delete', 'approve', 'export', 'manage'] },
      { resource: 'users', actions: ['create', 'read', 'update', 'delete', 'approve', 'export', 'manage'] },
      { resource: 'stations', actions: ['create', 'read', 'update', 'delete', 'export', 'manage'] },
      { resource: 'districts', actions: ['create', 'read', 'update', 'delete', 'export', 'manage'] },
      { resource: 'analytics', actions: ['read', 'export', 'manage'] },
      { resource: 'reports', actions: ['create', 'read', 'update', 'delete', 'export', 'manage'] },
      { resource: 'network', actions: ['create', 'read', 'update', 'delete', 'export', 'manage'] },
      { resource: 'ai', actions: ['read', 'manage'] }
    ],
    isDefault: false,
    isActive: true
  },
  {
    name: 'scrb_officer',
    displayName: 'SCRB Officer',
    description: 'State Crime Records Bureau officer with state-wide access',
    level: 8,
    permissions: [
      { resource: 'crimes', actions: ['create', 'read', 'update', 'approve', 'export'] },
      { resource: 'users', actions: ['read'] },
      { resource: 'stations', actions: ['read'] },
      { resource: 'districts', actions: ['read'] },
      { resource: 'analytics', actions: ['read', 'export'] },
      { resource: 'reports', actions: ['create', 'read', 'update', 'export'] },
      { resource: 'network', actions: ['read'] },
      { resource: 'ai', actions: ['read'] }
    ],
    isDefault: false,
    isActive: true
  },
  {
    name: 'district_officer',
    displayName: 'District Officer',
    description: 'District-level officer with district-wide access',
    level: 6,
    permissions: [
      { resource: 'crimes', actions: ['create', 'read', 'update', 'approve', 'export'] },
      { resource: 'users', actions: ['read'] },
      { resource: 'stations', actions: ['read'] },
      { resource: 'districts', actions: ['read'] },
      { resource: 'analytics', actions: ['read', 'export'] },
      { resource: 'reports', actions: ['create', 'read', 'update', 'export'] }
    ],
    isDefault: false,
    isActive: true
  },
  {
    name: 'station_officer',
    displayName: 'Police Station Officer',
    description: 'Police station officer with station-level access',
    level: 4,
    permissions: [
      { resource: 'crimes', actions: ['create', 'read', 'update', 'export'] },
      { resource: 'users', actions: ['read'] },
      { resource: 'stations', actions: ['read'] },
      { resource: 'analytics', actions: ['read'] },
      { resource: 'reports', actions: ['create', 'read', 'export'] }
    ],
    isDefault: true,
    isActive: true
  },
  {
    name: 'analyst',
    displayName: 'Crime Analyst',
    description: 'Analyst focused on crime data analysis',
    level: 5,
    permissions: [
      { resource: 'crimes', actions: ['read', 'export'] },
      { resource: 'analytics', actions: ['read', 'export'] },
      { resource: 'reports', actions: ['read', 'export'] },
      { resource: 'network', actions: ['read'] },
      { resource: 'ai', actions: ['read'] }
    ],
    isDefault: false,
    isActive: true
  },
  {
    name: 'viewer',
    displayName: 'Viewer',
    description: 'Read-only access to crime data',
    level: 2,
    permissions: [
      { resource: 'crimes', actions: ['read'] },
      { resource: 'analytics', actions: ['read'] },
      { resource: 'reports', actions: ['read'] }
    ],
    isDefault: false,
    isActive: true
  }
];

const seedRoles = async () => {
  try {
    logger.info('🌱 Seeding roles...');

    for (const roleData of roles) {
      const existingRole = await Role.findOne({ name: roleData.name });
      
      if (existingRole) {
        // Update existing role
        await Role.updateOne({ name: roleData.name }, roleData);
        logger.info(`✅ Updated role: ${roleData.name}`);
      } else {
        // Create new role
        await Role.create(roleData);
        logger.info(`✅ Created role: ${roleData.name}`);
      }
    }

    logger.info('✅ Roles seeded successfully!');
  } catch (error) {
    logger.error('❌ Error seeding roles:', error);
    throw error;
  }
};

const deleteRoles = async () => {
  try {
    await Role.deleteMany({});
    logger.info('✅ All roles deleted');
  } catch (error) {
    logger.error('❌ Error deleting roles:', error);
    throw error;
  }
};

module.exports = { seedRoles, deleteRoles };