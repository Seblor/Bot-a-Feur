import { Message } from "discord.js";
import Detector from "./Detector";
import { cleanMessageContent } from "../utils/strings";

const answers: Array<string> = [
  '# NON',
  "Non mais t'es pas bien toi ?",
  'https://tenor.com/view/kaamelott-leodagan-somme-sorte-provocateur-gif-18229391',
  '@Modération'
]

export default class QuoicoubehDetector extends Detector {
  protected triggerName = 'quoicoubeh' as 'quoicoubeh'

  protected detect(message: Message): boolean {
    return /(?:^|\b)(quoi)?coubeh(?:\b|$)/i.test(cleanMessageContent(message))
  }

  protected createSpecificReply(message: Message): Promise<string | null> {
    if (this.detect(message)) {
      return Promise.resolve(answers[Math.floor(Math.random() * answers.length)])
    }
    return Promise.resolve(null)
  }
}
