import { Message } from "discord.js";
import Detector from "./Detector";
import { cleanMessageContent } from "../utils/strings";
import { getSetting } from "../db";

const answers: Array<string> = [
  '# NON',
  "Non mais t'es pas bien toi ?",
  'https://tenor.com/view/kaamelott-leodagan-somme-sorte-provocateur-gif-18229391',
  '@Modération'
]

export default class QuoicoubehDetector extends Detector {
  protected detect(message: Message): boolean {
    return /(?:^|\b)quoicoubeh(?:\b|$)/i.test(cleanMessageContent(message))
  }

  protected getChanceToReply(message: Message): number {
    if (message.guildId == null) {
      return 0
    }
    return getSetting(message.guildId, 'quoicoubehAnswerPercentage')
  }

  protected createSpecificReply(message: Message): Promise<string | null> {
    if (this.detect(message)) {
      return Promise.resolve(answers[Math.floor(Math.random() * answers.length)])
    }
    return Promise.resolve(null)
  }
}
