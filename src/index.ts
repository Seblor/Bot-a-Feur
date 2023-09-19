// Connect to Discord
import { Client, IntentsBitField, OAuth2Scopes, WebhookClient, AuditLogEvent, Interaction, PermissionsBitField, Guild, GuildAuditLogsEntry, ChatInputCommandInteraction, ModalSubmitInteraction } from 'discord.js'

import logger from './logger'
import commands from './commands'
import { messageEditListener, newMessageListener } from './messageListeners'

const webhookClient = process.env.LOGS_WEBHOOK ? new WebhookClient({ url: process.env.LOGS_WEBHOOK as string }) : null

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ]
})

// client
//   .on('error', console.log)
//   .on('debug', console.log)
//   .on('warn', console.log)

client.on('guildCreate', async (guild: Guild) => {
  const logs = await guild.fetchAuditLogs().catch(() => null)
  const inviter = logs?.entries
    .find((l: GuildAuditLogsEntry) => l.action === AuditLogEvent.BotAdd &&
      l.targetId === client.user?.id)?.executor

  void webhookClient?.send({
    content: `Joined guild:
\`\`\`
name: ${guild.name} (${guild.id})
inviter: ${inviter != null ? ` invited by ${inviter.tag} (${inviter.id})` : ' (unknown inviter)'}
member count: ${guild.memberCount}
\`\`\``
  })
})

client.on('guildDelete', async guild => {
  void webhookClient?.send({
    content: `Left guild ${guild.name} (${guild.id})`
  })
})

client.on('ready', async () => {
  logger.info(`Logged in as ${client.user?.tag ?? 'unknown'}`)
  console.log(`Logged in as ${client.user?.tag ?? 'unknown'}`)

  void webhookClient?.send({
    content: `Logged in as ${client.user?.tag ?? 'unknown'}`
  })

  await client.guilds.fetch()

  console.log('Bot is ready!')
  console.log(client.generateInvite({
    scopes: [
      OAuth2Scopes.Bot
    ],
    permissions: [
      'SendMessages',
      'UseApplicationCommands',
      'EmbedLinks',
      'ReadMessageHistory'
    ]
  }))

  client.application?.commands.set([
    commands['channel-ignore'].command,
    commands['get-config'].command,
    commands['set-config'].command,
  ])

})

client.on('interactionCreate', async (interaction: Interaction) => {
  if (!interaction.guild || !interaction.member) {
    return
  }

  switch (true) {
    case interaction.isChatInputCommand() && interaction.commandName === 'channel-ignore':
      await commands['channel-ignore'].run(interaction as ChatInputCommandInteraction)
      break;
    case interaction.isChatInputCommand() && interaction.commandName === 'get-config':
      await commands['get-config'].run(interaction as ChatInputCommandInteraction)
      break;
    case interaction.isChatInputCommand() && interaction.commandName === 'set-config':
      await commands['set-config'].run(interaction as ChatInputCommandInteraction)
      break;
  }
})

client.on('messageCreate', async message => {
  if (message.author.bot) {
    return
  }
  newMessageListener(message)
})

client.on('messageUpdate', async (oldMessage, newMessage) => {
  let message = newMessage.partial ? await newMessage.fetch().catch((e) => {
    logger.error({
      message: 'Error while fetching message',
      error: e
    })
    return null
  }) : newMessage

  if (message === null) {
    return
  }

  if (message.author === null
    || message.author.bot
    || oldMessage.content === ''
    || oldMessage.content === message.content
    || oldMessage.content?.match(/(\b|^)quoi(\b|$)/i)) {
    return
  }

  messageEditListener(message)
})

void client.login(process.env.DISCORD_TOKEN)
