import { Message } from "discord.js";
import Detector from "./Detector";
import { cleanMessageContent } from "../utils/strings";

const answers: Array<string> = [
  "Toi t'es un bon",
  "ça j'aime, ça",
  ':thumbsup:',
  'https://tenor.com/view/laugh-smile-robin-hood-laughing-holding-it-gif-7858551',
  'https://tenor.com/view/kaamelott-yvain-exp%C3%A9ience-champion-cest-lexp%C3%A9rience-qui-parle-gif-17313437'
]

export default class FeurDetector extends Detector {
  protected triggerName = 'feur' as 'feur'

  protected detect(message: Message): boolean {
    return /(?:^|\b)feur(?:\b|$)/i.test(cleanMessageContent(message))
  }

  protected createSpecificReply(message: Message): Promise<string | null> {
    if (this.detect(message)) {
      return Promise.resolve(answers[Math.floor(Math.random() * answers.length)])
    }
    return Promise.resolve(null)
  }
}
