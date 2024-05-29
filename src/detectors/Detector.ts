import { Message } from "discord.js";
import { getSetting } from "../db";

enum TriggerState {
  untriggered, // The trigger has not been detected
  replied, // The trigger has been detected and the reply has been sent
  canReply, // The trigger has passed the randomizer, but no message has been sent yet
  cannotReply, // The trigger has not passed the randomizer
}

export function createTriggersChecklist() {
  return {
    'quoi': TriggerState.untriggered,
    'feur': TriggerState.untriggered,
    'mention': TriggerState.untriggered,
    'quoicoubeh': TriggerState.untriggered,
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
    if (ignoredRoleId !== null && (await message.member?.fetch())?.roles.cache.has(ignoredRoleId)) {
      return Promise.resolve('')
    }

    const forcedRoleId = getSetting(message.guildId, 'forcedAnswerRoleId')

    const threshold = forcedRoleId != null ? 100 : this.getChanceToReply(message)

    triggersChecklist = triggersChecklist ?? createTriggersChecklist()

    switch (triggersChecklist[this.triggerName]) {
      case TriggerState.replied:
        return Promise.resolve('')
      case TriggerState.untriggered:
        if (Math.floor(Math.random() * 100) < threshold) {
          triggersChecklist[this.triggerName] = TriggerState.canReply
        } else {
          triggersChecklist[this.triggerName] = TriggerState.cannotReply
        }
        break
    }

    if (triggersChecklist[this.triggerName] === TriggerState.canReply) {
      const detected = await this.createSpecificReply(message)
      if (detected !== null) {
        triggersChecklist[this.triggerName] = TriggerState.replied
        return detected
      }
    }
    if (this.nextDetector) {
      return this.nextDetector.createReply(message, triggersChecklist)
    }
    return Promise.resolve('')
  }
}