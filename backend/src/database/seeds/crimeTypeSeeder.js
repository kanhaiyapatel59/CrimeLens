/**
 * Crime Type Seeder - Creates crime classifications
 */

const CrimeType = require('../../models/CrimeType');
const logger = require('../../utils/logger');

const crimeTypes = [
  {
    name: 'Murder',
    code: 'IPC302',
    category: 'violent_crime',
    subCategory: 'Homicide',
    ipcSections: ['302', '300'],
    bnsSections: ['103'],
    bailability: 'non_bailable',
    severity: 'critical',
    punishment: { minSentence: 'Life Imprisonment', maxSentence: 'Death Penalty', fine: 'Varies' },
    isActive: true,
    visual: { color: '#d32f2f', icon: '🔪', emoji: '⚰️' }
  },
  {
    name: 'Robbery',
    code: 'IPC392',
    category: 'property_crime',
    subCategory: 'Theft with Violence',
    ipcSections: ['392', '394', '397'],
    bnsSections: ['135', '136'],
    bailability: 'non_bailable',
    severity: 'high',
    punishment: { minSentence: '7 Years', maxSentence: 'Life Imprisonment', fine: 'Varies' },
    isActive: true,
    visual: { color: '#f57c00', icon: '🔫', emoji: '💰' }
  },
  {
    name: 'Theft',
    code: 'IPC378',
    category: 'property_crime',
    subCategory: 'Theft',
    ipcSections: ['378', '379', '380'],
    bnsSections: ['133'],
    bailability: 'bailable',
    severity: 'medium',
    punishment: { minSentence: 'Up to 3 Years', maxSentence: '7 Years', fine: 'Varies' },
    isActive: true,
    visual: { color: '#ffa726', icon: '👤', emoji: '🏃' }
  },
  {
    name: 'Rape',
    code: 'IPC376',
    category: 'sexual_offense',
    subCategory: 'Sexual Assault',
    ipcSections: ['376', '376A', '376B', '376C', '376D'],
    bnsSections: ['63', '64', '65'],
    bailability: 'non_bailable',
    severity: 'critical',
    punishment: { minSentence: '7 Years', maxSentence: 'Life Imprisonment', fine: 'Varies' },
    isActive: true,
    visual: { color: '#7b1fa2', icon: '🚫', emoji: '😢' }
  },
  {
    name: 'Burglary',
    code: 'IPC445',
    category: 'property_crime',
    subCategory: 'House Breaking',
    ipcSections: ['445', '446', '449', '450'],
    bnsSections: ['137', '138'],
    bailability: 'bailable',
    severity: 'medium',
    punishment: { minSentence: 'Up to 3 Years', maxSentence: '10 Years', fine: 'Varies' },
    isActive: true,
    visual: { color: '#ff6f00', icon: '🏠', emoji: '🔓' }
  },
  {
    name: 'Drug Trafficking',
    code: 'NDPS20',
    category: 'drug_related',
    subCategory: 'Narcotics',
    ipcSections: ['NDPS Act'],
    bnsSections: ['NDPS Act'],
    bailability: 'non_bailable',
    severity: 'high',
    punishment: { minSentence: '10 Years', maxSentence: 'Life Imprisonment', fine: '1 Lakh+' },
    isActive: true,
    visual: { color: '#388e3c', icon: '💊', emoji: '🚫' }
  },
  {
    name: 'Cyber Crime',
    code: 'IT66',
    category: 'cyber_crime',
    subCategory: 'Digital Offense',
    ipcSections: ['IT Act'],
    bnsSections: ['IT Act'],
    bailability: 'bailable',
    severity: 'medium',
    punishment: { minSentence: 'Up to 3 Years', maxSentence: '7 Years', fine: '5 Lakhs' },
    isActive: true,
    visual: { color: '#0d47a1', icon: '💻', emoji: '🌐' }
  },
  {
    name: 'Organized Crime',
    code: 'MCOCA',
    category: 'organised_crime',
    subCategory: 'Syndicate Crime',
    ipcSections: ['MCOCA'],
    bnsSections: ['MCOCA'],
    bailability: 'non_bailable',
    severity: 'critical',
    punishment: { minSentence: '5 Years', maxSentence: 'Life Imprisonment', fine: 'Varies' },
    isActive: true,
    visual: { color: '#1a237e', icon: '🔗', emoji: '🏛️' }
  },
  {
    name: 'Terrorism',
    code: 'UAPA',
    category: 'terrorism',
    subCategory: 'Terrorist Activity',
    ipcSections: ['UAPA', 'TADA'],
    bnsSections: ['UAPA', 'TADA'],
    bailability: 'non_bailable',
    severity: 'critical',
    punishment: { minSentence: 'Life Imprisonment', maxSentence: 'Death Penalty', fine: 'Varies' },
    isActive: true,
    visual: { color: '#b71c1c', icon: '💣', emoji: '☠️' }
  },
  {
    name: 'Money Laundering',
    code: 'PMLA',
    category: 'economic_crime',
    subCategory: 'Financial Crime',
    ipcSections: ['PMLA'],
    bnsSections: ['PMLA'],
    bailability: 'non_bailable',
    severity: 'high',
    punishment: { minSentence: '3 Years', maxSentence: '7 Years', fine: 'Unlimited' },
    isActive: true,
    visual: { color: '#4e342e', icon: '💰', emoji: '💵' }
  },
  {
    name: 'Kidnapping',
    code: 'IPC363',
    category: 'violent_crime',
    subCategory: 'Abduction',
    ipcSections: ['363', '364', '365', '366', '367'],
    bnsSections: ['124', '125', '126'],
    bailability: 'non_bailable',
    severity: 'critical',
    punishment: { minSentence: '7 Years', maxSentence: 'Life Imprisonment', fine: 'Varies' },
    isActive: true,
    visual: { color: '#e65100', icon: '🚶', emoji: '🔒' }
  },
  {
    name: 'Arson',
    code: 'IPC435',
    category: 'property_crime',
    subCategory: 'Fire Offense',
    ipcSections: ['435', '436', '437'],
    bnsSections: ['139'],
    bailability: 'non_bailable',
    severity: 'high',
    punishment: { minSentence: '3 Years', maxSentence: '14 Years', fine: 'Varies' },
    isActive: true,
    visual: { color: '#e53935', icon: '🔥', emoji: '🔥' }
  },
  {
    name: 'Assault',
    code: 'IPC351',
    category: 'violent_crime',
    subCategory: 'Physical Assault',
    ipcSections: ['351', '352', '353', '354'],
    bnsSections: ['121', '122'],
    bailability: 'bailable',
    severity: 'medium',
    punishment: { minSentence: 'Up to 3 Months', maxSentence: '3 Years', fine: 'Varies' },
    isActive: true,
    visual: { color: '#f44336', icon: '👊', emoji: '🤕' }
  },
  {
    name: 'Human Trafficking',
    code: 'IPC370',
    category: 'human_trafficking',
    subCategory: 'Trafficking',
    ipcSections: ['370', '371', '372', '373'],
    bnsSections: ['128', '129'],
    bailability: 'non_bailable',
    severity: 'critical',
    punishment: { minSentence: '7 Years', maxSentence: 'Life Imprisonment', fine: 'Varies' },
    isActive: true,
    visual: { color: '#4a148c', icon: '👥', emoji: '⛓️' }
  },
  {
    name: 'Hit and Run',
    code: 'IPC304A',
    category: 'traffic_offense',
    subCategory: 'Traffic Accident',
    ipcSections: ['304A', '279'],
    bnsSections: ['135', '136'],
    bailability: 'bailable',
    severity: 'medium',
    punishment: { minSentence: 'Up to 2 Years', maxSentence: '10 Years', fine: 'Varies' },
    isActive: true,
    visual: { color: '#455a64', icon: '🚗', emoji: '🏃' }
  },
  {
    name: 'Gambling',
    code: 'IPC294A',
    category: 'public_order',
    subCategory: 'Illegal Gambling',
    ipcSections: ['294A'],
    bnsSections: ['109'],
    bailability: 'bailable',
    severity: 'low',
    punishment: { minSentence: 'Up to 6 Months', maxSentence: '1 Year', fine: '1000' },
    isActive: true,
    visual: { color: '#795548', icon: '🎰', emoji: '🃏' }
  },
  {
    name: 'Traffic Violation',
    code: 'MVAct',
    category: 'traffic_offense',
    subCategory: 'Traffic Offense',
    ipcSections: ['MV Act'],
    bnsSections: ['MV Act'],
    bailability: 'bailable',
    severity: 'low',
    punishment: { minSentence: 'Fine', maxSentence: 'Up to 6 Months', fine: 'Varies' },
    isActive: true,
    visual: { color: '#78909c', icon: '🚦', emoji: '🚗' }
  }
];

const seedCrimeTypes = async () => {
  try {
    logger.info('🌱 Seeding crime types...');

    for (const crimeData of crimeTypes) {
      const existingCrime = await CrimeType.findOne({ code: crimeData.code });
      
      if (existingCrime) {
        await CrimeType.updateOne({ code: crimeData.code }, crimeData);
        logger.info(`✅ Updated crime type: ${crimeData.name}`);
      } else {
        await CrimeType.create(crimeData);
        logger.info(`✅ Created crime type: ${crimeData.name}`);
      }
    }

    logger.info('✅ Crime types seeded successfully!');
  } catch (error) {
    logger.error('❌ Error seeding crime types:', error);
    throw error;
  }
};

const deleteCrimeTypes = async () => {
  try {
    await CrimeType.deleteMany({});
    logger.info('✅ All crime types deleted');
  } catch (error) {
    logger.error('❌ Error deleting crime types:', error);
    throw error;
  }
};

module.exports = { seedCrimeTypes, deleteCrimeTypes };