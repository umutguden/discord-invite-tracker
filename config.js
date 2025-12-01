/**
 * Configuration loader using environment variables
 * Create a .env file from .env.example
 */

require('dotenv').config();

module.exports = {
  // Bot credentials (REQUIRED)
  botToken: process.env.BOT_TOKEN || '',
  mongoUri: process.env.MONGO_URI || '',
  
  // Bot settings
  botPrefix: process.env.BOT_PREFIX || '!',
  botOwner: process.env.BOT_OWNER || '',
  
  // Customization
  embedColor: process.env.EMBED_COLOR || '#5865F2',
  fakeAccountDays: parseInt(process.env.FAKE_ACCOUNT_DAYS) || 7
};
