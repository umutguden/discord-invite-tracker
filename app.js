const { Client, MessageEmbed, Intents } = require('discord.js');
const mongoose = require('mongoose');
const config = require('./config.js');

// Initialize client with required intents
const client = new Client({
  fetchAllMembers: true,
  ws: { intents: ['GUILDS', 'GUILD_MEMBERS', 'GUILD_MESSAGES', 'GUILD_INVITES'] }
});

// Store invites per guild
const guildInvites = new Map();

// Connect to MongoDB
mongoose.connect(config.mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('✅ Connected to MongoDB');
}).catch(err => {
  console.error('❌ MongoDB connection failed:', err.message);
  process.exit(1);
});

const Inviter = require('./models/inviter.js');

// ===================
// READY EVENT
// ===================
client.on('ready', async () => {
  console.log(`✅ Logged in as ${client.user.tag}`);
  console.log(`📊 Serving ${client.guilds.cache.size} server(s)`);
  
  client.user.setPresence({
    activity: { name: `${config.botPrefix}help | Invite Tracker`, type: 'WATCHING' },
    status: 'online'
  });

  // Cache invites for all guilds
  for (const guild of client.guilds.cache.values()) {
    try {
      const invites = await guild.fetchInvites();
      guildInvites.set(guild.id, invites);
    } catch (err) {
      console.log(`Could not fetch invites for ${guild.name}`);
    }
  }
});

// ===================
// INVITE EVENTS
// ===================
client.on('inviteCreate', async invite => {
  try {
    const invites = await invite.guild.fetchInvites();
    guildInvites.set(invite.guild.id, invites);
  } catch (err) {}
});

client.on('inviteDelete', async invite => {
  setTimeout(async () => {
    try {
      const invites = await invite.guild.fetchInvites();
      guildInvites.set(invite.guild.id, invites);
    } catch (err) {}
  }, 5000);
});

// ===================
// MEMBER JOIN
// ===================
client.on('guildMemberAdd', async member => {
  try {
    const cachedInvites = guildInvites.get(member.guild.id);
    const newInvites = await member.guild.fetchInvites();
    
    // Find which invite was used
    let usedInvite = newInvites.find(inv => {
      const cached = cachedInvites?.get(inv.code);
      return cached && cached.uses < inv.uses;
    });
    
    if (!usedInvite) {
      usedInvite = cachedInvites?.find(inv => !newInvites.has(inv.code));
    }
    
    if (!usedInvite) {
      usedInvite = { code: member.guild.vanityURLCode, uses: null, inviter: { id: null } };
    }

    const inviter = client.users.cache.get(usedInvite.inviter?.id) || { id: member.guild.id };
    const fakeThreshold = config.fakeAccountDays * 24 * 60 * 60 * 1000;
    const isFake = (Date.now() - member.user.createdTimestamp) < fakeThreshold;

    // Save/update joined member data
    let joinedMember = await Inviter.findOne({ guildID: member.guild.id, userID: member.id });
    if (!joinedMember) {
      joinedMember = new Inviter({
        _id: new mongoose.Types.ObjectId(),
        guildID: member.guild.id,
        userID: member.id,
        inviterID: inviter.id,
        regular: 0,
        bonus: 0,
        fake: 0
      });
    } else {
      joinedMember.inviterID = inviter.id;
    }
    await joinedMember.save();

    // Update inviter stats
    let inviterData = await Inviter.findOne({ guildID: member.guild.id, userID: inviter.id });
    if (!inviterData) {
      inviterData = new Inviter({
        _id: new mongoose.Types.ObjectId(),
        guildID: member.guild.id,
        userID: inviter.id,
        inviterID: null,
        regular: isFake ? 0 : 1,
        bonus: 0,
        fake: isFake ? 1 : 0
      });
    } else {
      if (isFake) {
        inviterData.fake++;
      } else {
        inviterData.regular++;
      }
    }
    await inviterData.save();

    // Update cached invites
    guildInvites.set(member.guild.id, newInvites);
  } catch (err) {
    console.error('Error tracking member join:', err.message);
  }
});

// ===================
// MEMBER LEAVE
// ===================
client.on('guildMemberRemove', async member => {
  try {
    const fakeThreshold = config.fakeAccountDays * 24 * 60 * 60 * 1000;
    const isFake = (Date.now() - member.user.createdTimestamp) < fakeThreshold;

    const memberData = await Inviter.findOne({ guildID: member.guild.id, userID: member.id });
    if (memberData?.inviterID) {
      const inviterData = await Inviter.findOne({ guildID: member.guild.id, userID: memberData.inviterID });
      if (inviterData) {
        if (isFake) {
          if (inviterData.fake > 0) inviterData.fake--;
        } else {
          if (inviterData.regular > 0) inviterData.regular--;
        }
        await inviterData.save();
      }
    }
  } catch (err) {
    console.error('Error tracking member leave:', err.message);
  }
});

// ===================
// GUILD JOIN (Bot added to new server)
// ===================
client.on('guildCreate', async guild => {
  try {
    const invites = await guild.fetchInvites();
    guildInvites.set(guild.id, invites);
    console.log(`✅ Joined new server: ${guild.name}`);
  } catch (err) {}
});

// ===================
// COMMANDS
// ===================
client.on('message', async message => {
  if (message.author.bot || !message.guild) return;
  if (!message.content.toLowerCase().startsWith(config.botPrefix)) return;

  const args = message.content.slice(config.botPrefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  // ===================
  // INVITES COMMAND
  // ===================
  if (command === 'invites' || command === 'inv') {
    const target = message.mentions.members.first() || 
                   message.guild.members.cache.get(args[0]) || 
                   message.member;

    const data = await Inviter.findOne({ guildID: message.guild.id, userID: target.id });
    
    const embed = new MessageEmbed()
      .setAuthor(target.displayName, target.user.displayAvatarURL({ dynamic: true }))
      .setColor(config.embedColor)
      .setTimestamp();

    if (!data) {
      embed.setDescription('No invite data found for this user.');
    } else {
      const total = (data.regular || 0) + (data.bonus || 0);
      embed.setDescription(
        `**${target.displayName}** has **${total}** invites\n\n` +
        `✅ Regular: **${data.regular || 0}**\n` +
        `🎁 Bonus: **${data.bonus || 0}**\n` +
        `❌ Fake: **${data.fake || 0}**`
      );
    }

    return message.channel.send(embed);
  }

  // ===================
  // LEADERBOARD COMMAND
  // ===================
  if (command === 'leaderboard' || command === 'lb' || command === 'top') {
    const allData = await Inviter.find({ guildID: message.guild.id });
    
    const sorted = allData
      .filter(x => message.guild.members.cache.has(x.userID))
      .map(x => ({
        userID: x.userID,
        total: (x.regular || 0) + (x.bonus || 0)
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 10);

    const embed = new MessageEmbed()
      .setTitle('📊 Invite Leaderboard')
      .setColor(config.embedColor)
      .setTimestamp();

    if (!sorted.length) {
      embed.setDescription('No invite data found.');
    } else {
      const description = sorted.map((entry, i) => {
        const member = message.guild.members.cache.get(entry.userID);
        const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `\`${i + 1}.\``;
        return `${medal} ${member} — **${entry.total}** invites`;
      }).join('\n');
      embed.setDescription(description);
    }

    return message.channel.send(embed);
  }

  // ===================
  // BONUS COMMAND (Admin only)
  // ===================
  if (command === 'bonus' || command === 'addbonus') {
    if (!message.member.hasPermission('ADMINISTRATOR')) {
      return message.reply('❌ You need Administrator permission to use this command.');
    }

    const target = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    const amount = parseInt(args[1]);

    if (!target || isNaN(amount)) {
      return message.reply(`Usage: \`${config.botPrefix}bonus @user <amount>\`\nExample: \`${config.botPrefix}bonus @user 10\` or \`${config.botPrefix}bonus @user -5\``);
    }

    let data = await Inviter.findOne({ guildID: message.guild.id, userID: target.id });
    if (!data) {
      data = new Inviter({
        _id: new mongoose.Types.ObjectId(),
        guildID: message.guild.id,
        userID: target.id,
        inviterID: null,
        regular: 0,
        bonus: amount,
        fake: 0
      });
    } else {
      data.bonus = (data.bonus || 0) + amount;
    }
    await data.save();

    const embed = new MessageEmbed()
      .setColor(config.embedColor)
      .setDescription(`${amount >= 0 ? '✅' : '➖'} ${amount >= 0 ? 'Added' : 'Removed'} **${Math.abs(amount)}** bonus invites ${amount >= 0 ? 'to' : 'from'} ${target}\nNew bonus total: **${data.bonus}**`);

    return message.channel.send(embed);
  }

  // ===================
  // INVITER COMMAND (Who invited a user)
  // ===================
  if (command === 'inviter' || command === 'whoinvited') {
    const target = message.mentions.members.first() || 
                   message.guild.members.cache.get(args[0]) || 
                   message.member;

    const data = await Inviter.findOne({ guildID: message.guild.id, userID: target.id });
    
    const embed = new MessageEmbed()
      .setColor(config.embedColor)
      .setTimestamp();

    if (!data || !data.inviterID) {
      embed.setDescription(`Could not find who invited **${target.displayName}**.`);
    } else {
      const inviter = message.guild.members.cache.get(data.inviterID);
      embed.setDescription(`**${target.displayName}** was invited by ${inviter ? inviter : 'Unknown User'}`);
    }

    return message.channel.send(embed);
  }

  // ===================
  // HELP COMMAND
  // ===================
  if (command === 'help') {
    const embed = new MessageEmbed()
      .setTitle('📋 Invite Tracker Commands')
      .setColor(config.embedColor)
      .setDescription('Track and manage server invites.')
      .addField('📊 Information', [
        `\`${config.botPrefix}invites [@user]\` — View invite count`,
        `\`${config.botPrefix}leaderboard\` — Top 10 inviters`,
        `\`${config.botPrefix}inviter [@user]\` — See who invited a user`
      ].join('\n'))
      .addField('⚙️ Administration', [
        `\`${config.botPrefix}bonus @user <amount>\` — Add/remove bonus invites`
      ].join('\n'))
      .setFooter('[] = optional, <> = required')
      .setTimestamp();

    return message.channel.send(embed);
  }

  // ===================
  // EVAL COMMAND (Owner only)
  // ===================
  if (command === 'eval' && message.author.id === config.botOwner) {
    if (!args[0]) return message.reply('No code provided.');
    
    const code = args.join(' ');
    const clean = text => {
      if (typeof text !== 'string') text = require('util').inspect(text, { depth: 0 });
      return text.replace(/`/g, '`\u200b').replace(/@/g, '@\u200b').replace(config.botToken, '[REDACTED]');
    };

    try {
      const evaled = clean(await eval(code));
      message.channel.send(evaled, { code: 'js', split: true });
    } catch (err) {
      message.channel.send(clean(err), { code: 'js', split: true });
    }
  }
});

// ===================
// LOGIN
// ===================
if (!config.botToken) {
  console.error('❌ No bot token provided! Set BOT_TOKEN environment variable or update config.json');
  process.exit(1);
}

if (!config.mongoUri) {
  console.error('❌ No MongoDB URI provided! Set MONGO_URI environment variable or update config.json');
  process.exit(1);
}

client.login(config.botToken).catch(err => {
  console.error('❌ Failed to login:', err.message);
  process.exit(1);
});
