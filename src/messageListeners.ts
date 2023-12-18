import { GuildBasedChannel, Message } from "discord.js"
import firstDetector from "./detectors"
import logger from "./logger"
import { getIgnoredChannels } from "./db"

const newMessageEffects = [
  async (message: Message, reply: string) => {
    const newMessage = await message.reply('Error: Command not recognized. Please use a valid bot command. If you need assistance, type "!help" for a list of available commands or reach out to a moderator for support.')

    await Bun.sleep(5000)

    await newMessage.edit(reply + `
Haha ! Je t'ai bien eu !`)
  }
]

const newMessageModifiers: Array<string | ((message: Message, reply: string) => void)> = [
  `§
Le saviez-vous ? Vous pouvez m'ajouter à votre serveur, je suis configurable !`,
  `§
Le saviez-vous ? Minecraft-France utilise [Plume](<https://plume.red>) pour aider à la modération !`,
  `§
Le saviez-vous ? C'est Seblor qui m'a créé ! (En plus il est beau)`,
  `§
Le saviez-vous ? Il y a [un timelapse de mon développement](<https://www.youtube.com/watch?v=dQw4w9WgXcQ>)`,
  ...newMessageEffects,
  ...Array(50).fill('§') // Filling the array with 50 '$' (a no-op modifier) to decrease the chance of getting a modified reply
]

const messageEditModifiers: Array<string> = [
  `§
T'as cru que je ne t'aurai pas, petit malin ?`,
  `Hep hep hep, toi, là !
§`,
  '§',
  '§',
]

export async function newMessageListener(message: Message): Promise<void> {
  if (message.guildId === null) {
    return
  }

  const ignoredChannels = getIgnoredChannels(message.guildId).map(r => r.channelId)
  const messageChannel = message.channel as GuildBasedChannel
  if (ignoredChannels.includes(messageChannel.id) || ignoredChannels.includes(messageChannel.parentId ?? '') || ignoredChannels.includes(messageChannel.parent?.parentId ?? '')) {
    return
  }

  const replyString = await firstDetector.createReply(message)
  if (replyString) {
    const modifier = newMessageModifiers[Math.floor(Math.random() * newMessageModifiers.length)]
    if (typeof modifier === 'function') {
      return modifier(message, replyString)
    } else {
      void message.reply(modifier.replace('§', replyString))
    }
  }
}

export async function messageEditListener(message: Message): Promise<void> {
  if (message.guildId === null) {
    return
  }

  const ignoredChannels = getIgnoredChannels(message.guildId).map(r => r.channelId)
  const messageChannel = message.channel as GuildBasedChannel
  if (ignoredChannels.includes(messageChannel.id) || ignoredChannels.includes(messageChannel.parentId ?? '') || ignoredChannels.includes(messageChannel.parent?.parentId ?? '')) {
    return
  }

  const replyString = await firstDetector
    .createReply(message)
    .catch((e) => {
      logger.error({
        message: 'Error while replying to a message edit',
        messageObject: message.toJSON(),
        error: e,
      })
    })

  if (replyString) {
    const modifier = messageEditModifiers[Math.floor(Math.random() * messageEditModifiers.length)]
    void message.reply(modifier.replace('§', replyString)).catch((e) => {
      logger.error({
        message: 'Error while replying to a message edit',
        messageObject: message.toJSON(),
        answer: replyString,
        error: e,
      })
    })
  }
}