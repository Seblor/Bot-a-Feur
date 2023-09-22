import { Message } from "discord.js";
import Detector from "./Detector";
import { cleanMessageContent } from "../utils/strings";
import { getSetting } from "../db";

const answers: Array<string> = [
  'Oui ? (stiti)',
  "On m'a appelé ?",
  'https://tenor.com/view/bonjour-hello-oss117-jean-dujardin-hubert-bonisseur-de-la-bath-gif-13920747',
  'https://tenor.com/view/casse-fracasse-chabal-destroy-mur-gif-21656168'
]

export default class PingDetector extends Detector {
  protected async detect(message: Message): Promise<boolean> {
    if (/(^|\b)(feur|quoicoubeh)(\b|$)/i.test(cleanMessageContent(message))) {
      return false
    }

    return message.mentions.has(message.client.user)
  }

  protected getChanceToReply(message: Message): number {
    if (message.guildId == null) {
      return 0
    }
    return getSetting(message.guildId, 'mentionAnswerPercentage')
  }

  protected async createSpecificReply(message: Message): Promise<string | null> {
    if (await this.detect(message)) {
      return Promise.resolve(answers[Math.floor(Math.random() * answers.length)])
    }
    return Promise.resolve(null)
  }
}
