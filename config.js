/**
 * Configuration loader with environment variable support
 * Environment variables override config.json values
 */

require('dotenv').config();

const defaultConfig = {
  botToken: '',
  botPrefix: '!',
  mongoUri: '',
  botOwner: '',
  embedColor: '#5865F2',
  fakeAccountDays: 7
};

let fileConfig = {};
try {
  fileConfig = require('./config.json');
} catch (e) {
  // config.json not found, using defaults
}

module.exports = {
  // Bot credentials (REQUIRED)
  botToken: process.env.BOT_TOKEN || fileConfig.botToken || defaultConfig.botToken,
  mongoUri: process.env.MONGO_URI || fileConfig.mongoUri || defaultConfig.mongoUri,
  
  // Bot settings
  botPrefix: process.env.BOT_PREFIX || fileConfig.botPrefix || defaultConfig.botPrefix,
  botOwner: process.env.BOT_OWNER || fileConfig.botOwner || defaultConfig.botOwner,
  
  // Customization
  embedColor: process.env.EMBED_COLOR || fileConfig.embedColor || defaultConfig.embedColor,
  fakeAccountDays: parseInt(process.env.FAKE_ACCOUNT_DAYS) || fileConfig.fakeAccountDays || defaultConfig.fakeAccountDays
};
