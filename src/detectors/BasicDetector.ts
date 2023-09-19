import { Message } from "discord.js";
import Detector from "./Detector";
import { cleanMessageContent } from "../utils/strings";

const answers: Array<string> = [
  ...Array(10).fill('feur'),
  '# feur',
  '||quoicoubeh|| feur'
]

export default class BasicDetector extends Detector {
  protected detect(message: Message): boolean {
    return /(?:^|\b)quoi\b ?\??(\s\S+){0,3}$/i.test(cleanMessageContent(message))
  }

  protected createSpecificReply(message: Message): Promise<string | null> {
    if (this.detect(message)) {
      return Promise.resolve(answers[Math.floor(Math.random() * answers.length)])
    }
    return Promise.resolve(null)
  }
}
