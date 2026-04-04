# Discord Invite Tracker

[![Licence: MIT](https://img.shields.io/badge/Licence-MIT-yellow.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-14+-green.svg)](https://nodejs.org/)
[![discord.js](https://img.shields.io/badge/discord.js-v12-blue.svg)](https://discord.js.org/)

A lightweight Discord bot that tracks server invites, maintains leaderboards, and supports bonus invite management.

## Features

- **Invite tracking**: automatically records who invited each member
- **Leaderboards**: displays top inviters in your server
- **Bonus system**: admins can add or remove bonus invites
- **Fake detection**: flags accounts created within 7 days
- **Leave tracking**: adjusts invite counts when members leave
- **Multi-server**: works across multiple Discord servers

## Prerequisites

- Node.js v14 or later
- MongoDB (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- [Discord bot token](https://discord.com/developers/applications)

## Quick Start

```bash
git clone https://github.com/umutguden/discord-invite-tracker.git
cd discord-invite-tracker
npm install

# Configure (see below)
cp config.example.json config.json
# Edit config.json with your values

npm start
```

## Configuration

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

### Option 2: Environment Variables

```bash
cp .env.example .env
```

```bash
BOT_TOKEN=your_discord_bot_token
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/invites
BOT_PREFIX=!
BOT_OWNER=your_discord_user_id
```

> **Security**: Never commit `config.json` or `.env` to version control.

## Commands

Default prefix: `!`

| Command | Description |
|---------|-------------|
| `!invites [@user]` | View invite count for yourself or another user |
| `!leaderboard` | Display top 10 inviters |
| `!inviter [@user]` | See who invited a specific user |
| `!bonus @user <amount>` | Add or remove bonus invites (admin only) |
| `!help` | Show all commands |

### Aliases

- `!invites` / `!inv`
- `!leaderboard` / `!lb` / `!top`
- `!inviter` / `!whoinvited`
- `!bonus` / `!addbonus`

## Invite Types

| Type | Description |
|------|-------------|
| **Regular** | Standard invites from invite links |
| **Bonus** | Manually added or removed by admins |
| **Fake** | Accounts less than 7 days old |

Total invite count: `Regular + Bonus` (fake invites are tracked separately).

## Project Structure

```
discord-invite-tracker/
├── app.js              # Main bot file
├── config.js           # Configuration loader
├── config.json         # Your config (gitignored)
├── config.example.json # Config template
├── .env                # Environment variables (gitignored)
├── .env.example        # Environment template
├── package.json        # Dependencies
├── Procfile            # Heroku deployment
├── LICENSE             # MIT Licence
└── models/
    └── inviter.js      # MongoDB schema
```

## Deployment

### Heroku

1. Create a new Heroku app.
2. Set config vars: `BOT_TOKEN`, `MONGO_URI`.
3. Deploy via GitHub integration or Git push. The included `Procfile` handles startup.

### Railway / Render

Set environment variables in the dashboard and deploy from GitHub.

### VPS / Self-Hosted

```bash
npm install -g pm2
pm2 start app.js --name invite-tracker
pm2 save
```

## Bot Permissions

Required Discord permissions:

- Manage Server (to access invite data)
- Read Messages / View Channels
- Send Messages
- Embed Links
- Add Reactions
- Read Message History

## Licence

MIT. See [LICENSE](LICENSE).

## Acknowledgements

Built with [discord.js](https://discord.js.org/) and [Mongoose](https://mongoosejs.com/).
