import { Message } from "discord.js";
import Detector from "./Detector";
import { cleanMessageContent } from "../utils/strings";

const answers: Array<string> = [
  'Oui ? (stiti)',
  "On m'a appelé ?",
  'https://tenor.com/view/bonjour-hello-oss117-jean-dujardin-hubert-bonisseur-de-la-bath-gif-13920747',
  'https://tenor.com/view/casse-fracasse-chabal-destroy-mur-gif-21656168'
]

export default class PingDetector extends Detector {
  protected triggerName = 'mention' as 'mention'

  protected async detect(message: Message): Promise<boolean> {
    if (/(^|\b)(feur|quoicoubeh)(\b|$)/i.test(cleanMessageContent(message))) {
      return false
    }

    return message.mentions.parsedUsers.has(message.client.user.id)
  }

  protected async createSpecificReply(message: Message): Promise<string | null> {
    if (await this.detect(message)) {
      return Promise.resolve(answers[Math.floor(Math.random() * answers.length)])
    }
    return Promise.resolve(null)
  }
}
