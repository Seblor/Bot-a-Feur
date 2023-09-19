import { Message } from "discord.js";

export function cleanMessageContent(message: Message) {
  return message.cleanContent.toLowerCase().replace(/@\S+/g, '')
}
