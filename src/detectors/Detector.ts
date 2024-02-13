import { Message } from "discord.js";
import { getSetting } from "../db";

export function createTriggersChecklist() {
  return {
    'quoi': false,
    'feur': false,
    'mention': false,
    'quoicoubeh': false,
  }
}

/**
 * Base class for all detectors
 * Using a Chain of Responsibility pattern
 */
export default class Detector {
  protected nextDetector: Detector | null = null

  protected triggerName: keyof ReturnType<typeof createTriggersChecklist> = 'quoi'

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
    return getSetting(message.guildId, `${this.triggerName}AnswerPercentage`)
  }

  async createReply(message: Message, triggersChecklist?: ReturnType<typeof createTriggersChecklist>): Promise<string | null> {
    if (message.guildId == null) {
      return Promise.reject(new Error('No guild ID'))
    }

    const ignoredRoleId = getSetting(message.guildId, 'ignoredRoleId')
    if (ignoredRoleId !== null && message.member?.roles.cache.has(ignoredRoleId)) {
      return Promise.resolve('')
    }

    const forcedRoleId = getSetting(message.guildId, 'forcedAnswerRoleId')

    const threshold = forcedRoleId != null ? 100 : this.getChanceToReply(message)

    triggersChecklist = triggersChecklist ?? createTriggersChecklist()

    if (!triggersChecklist[this.triggerName] && Math.floor(Math.random() * 100) < threshold) {
      const detected = await this.createSpecificReply(message)
      if (detected !== null) {
        return detected
      }
    } else {
      triggersChecklist[this.triggerName] = true
    }
    if (this.nextDetector) {
      return this.nextDetector.createReply(message, triggersChecklist)
    }
    return Promise.resolve('')
  }
}