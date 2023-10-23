import { Message } from "discord.js";
import { getSetting } from "../db";

/**
 * Base class for all detectors
 * Using a Chain of Responsibility pattern
 */
export default class Detector {
  protected nextDetector: Detector | null = null

  /**
   * @param nextDetector The detector that will be checked if this one doesn't detect anything
   * @returns The next detector
   */
  setNextDetector(nextDetector: Detector): Detector {
    this.nextDetector = nextDetector
    return nextDetector
  }

  protected createSpecificReply(message: Message): Promise<string | null> {
    return Promise.resolve(null);
  }

  protected getChanceToReply(message: Message): number {
    if (message.guildId == null) {
      return 0
    }
    return getSetting(message.guildId, 'quoiAnswerPercentage')
  }

  async createReply(message: Message): Promise<string | null> {
    if (message.guildId == null) {
      return Promise.reject(new Error('No guild ID'))
    }

    const threshold = this.getChanceToReply(message)

    if (Math.floor(Math.random() * 100) < threshold) {
      const detected = await this.createSpecificReply(message)
      if (detected !== null) {
        return detected
      }
    }
    if (this.nextDetector) {
      return this.nextDetector.createReply(message)
    }
    return Promise.resolve('')
  }
}