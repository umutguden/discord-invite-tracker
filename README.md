# Discord Invite Tracker 

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-14+-green.svg)](https://nodejs.org/)
[![discord.js](https://img.shields.io/badge/discord.js-v12-blue.svg)](https://discord.js.org/)

A lightweight Discord bot that tracks server invites, maintains leaderboards, and supports bonus invite management. Perfect for community servers that reward members for inviting others.

## ✨ Features

- 📊 **Invite Tracking** — Automatically tracks who invited each member
- 🏆 **Leaderboards** — Display top inviters in your server
- 🎁 **Bonus System** — Admins can add/remove bonus invites
- ❌ **Fake Detection** — Identifies accounts created within 7 days
- 🔄 **Leave Tracking** — Adjusts invite counts when members leave
- 🌐 **Multi-Server** — Works across multiple Discord servers
- 🔒 **Secure** — Environment variable support for credentials

## 📦 Prerequisites

- **Node.js** v14 or higher
- **MongoDB** database (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- A [Discord Bot Token](https://discord.com/developers/applications)

## 🚀 Quick Start

```bash
# Clone the repository
git clone https://github.com/umutguden/invite-tracker.git
cd invite-tracker

# Install dependencies
npm install

# Configure (see Configuration section)
cp config.example.json config.json
# Edit config.json with your values

# Start the bot
npm start
```

## ⚙️ Configuration

### Option 1: config.json

Copy `config.example.json` to `config.json` and fill in your values:

```json
{
  "botToken": "YOUR_BOT_TOKEN",
  "mongoUri": "mongodb+srv://user:pass@cluster.mongodb.net/invites",
  "botPrefix": "!",
  "botOwner": "YOUR_DISCORD_USER_ID",
  "embedColor": "#5865F2",
  "fakeAccountDays": 7
}
```

### Option 2: Environment Variables (Recommended for Production)

```bash
cp .env.example .env
```

Edit `.env`:

```bash
BOT_TOKEN=your_discord_bot_token
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/invites
BOT_PREFIX=!
BOT_OWNER=your_discord_user_id
```

> ⚠️ **Security:** Never commit `config.json` or `.env` to version control!

## 🎮 Commands

Default prefix: `!`

| Command | Description |
|---------|-------------|
| `!invites [@user]` | View invite count for yourself or another user |
| `!leaderboard` | Display top 10 inviters |
| `!inviter [@user]` | See who invited a specific user |
| `!bonus @user <amount>` | Add or remove bonus invites (Admin only) |
| `!help` | Show all commands |

### Command Aliases

- `!invites` → `!inv`
- `!leaderboard` → `!lb`, `!top`
- `!inviter` → `!whoinvited`
- `!bonus` → `!addbonus`

## 📊 Invite Types

| Type | Description |
|------|-------------|
| **Regular** | Standard invites from invite links |
| **Bonus** | Manually added/removed by admins |
| **Fake** | Accounts less than 7 days old |

The total invite count is: `Regular + Bonus` (Fake invites are tracked separately)

## 📁 Project Structure

```
invite-tracker/
├── app.js              # Main bot file
├── config.js           # Configuration loader
├── config.json         # Your config (gitignored)
├── config.example.json # Config template
├── .env                # Environment variables (gitignored)
├── .env.example        # Environment template
├── .gitignore          # Git ignore rules
├── package.json        # Dependencies
├── Procfile            # Heroku deployment
├── LICENSE             # MIT License
└── models/
    └── inviter.js      # MongoDB schema
```

## 🚀 Deployment

### Heroku

1. Create a new Heroku app
2. Set Config Vars:
   - `BOT_TOKEN`
   - `MONGO_URI`
3. Deploy via GitHub integration or Git push
4. The included `Procfile` handles startup

### Railway / Render

Set environment variables in the dashboard and deploy from GitHub.

### VPS / Self-Hosted

```bash
# Using PM2 for process management
npm install -g pm2
pm2 start app.js --name invite-tracker
pm2 save
```

## 🔧 Bot Permissions

The bot requires these Discord permissions:

- `Manage Server` — Required to access invite data
- `Read Messages` / `View Channels`
- `Send Messages`
- `Embed Links`
- `Add Reactions`
- `Read Message History`

**Invite URL with permissions:**
```
https://discord.com/api/oauth2/authorize?client_id=YOUR_CLIENT_ID&permissions=8&scope=bot
```

## 🔐 Security

- Use environment variables for production
- Never commit tokens or credentials
- The `.gitignore` excludes sensitive files by default

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

Built with [discord.js](https://discord.js.org/) and [Mongoose](https://mongoosejs.com/)
