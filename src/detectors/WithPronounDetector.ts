import { Message } from "discord.js";
import Detector from "./Detector";
import compromise from 'fr-compromise'
import conj from 'conjugation-fr'
import fs from 'fs/promises'
import { toInfinitive } from "../data";
import { cleanMessageContent } from "../utils/strings";

// const verbs = await Bun.file('../../data/verbs.json').json()
// const toInfinitive = await Bun.file('../../data/toInfinitive.json').json()
// const toInfinitive = await fs.readFile('../data/toInfinitive.json', 'utf-8').then(JSON.parse)

const compromiseResultExample = {
  text: "pensez",
  pre: "",
  post: " ",
  tags: ["Verb", "SecondPersonPlural", "PresentTense"],
  normal: "pensez",
  index: [0, 1],
  id: "pensez|00200001V",
  chunk: "Verb",
  dirty: true
};

type CompromiseResult = {
  text: string,
  terms: Array<typeof compromiseResultExample>
};

const suffixes = [
  ', mon gars',
  ', mec',
  ", je crois",
  '',
  '',
  ''
]

export default class WithPronounDetector extends Detector {
  protected async createSpecificReply(message: Message): Promise<string | null> {
    const reference = await message.fetchReference().catch(() => null)
    const isSelfTarget = (reference && reference.author.id === message.client.user.id) ?? false

    const compromiseMatch = compromise(cleanMessageContent(message).toLowerCase()).match('(#Pronoun|ça|ca|tu) (#Verb|fait) #Infinitive? quoi [<suffix>!Verb{0,3}]$')

    if (compromiseMatch == null || compromiseMatch.length === 0) {
      return null
    }

    return this.conjugateResponse(compromiseMatch, isSelfTarget)
  }

  conjugateResponse(compromiseMatch: any, isSelfTarget: boolean = false): string {
    const parsed = compromiseMatch.json() as CompromiseResult[]

    const result = parsed[0]

    const replySuffix = (compromiseMatch.groups('suffix') as any)?.text().trim() ?? ''

    if (result == null) {
      return '';
    }

    const verbInfinitive = toInfinitive[result.terms[1].text]

    let conjugated = ''


    switch (result.terms[0].text.toLowerCase()) {
      case 'je':
      case "j'":
        conjugated = `tu ${conj.findTense(verbInfinitive, result.terms[1].tags.find(t => t.endsWith('Tense')) ?? 'Present').find(c => c.pronoun === 'tu')!.verb}`;
        break;
      case 'tu':
      case "t'":
        if (isSelfTarget) {
          conjugated = `je ${conj.findTense(verbInfinitive, result.terms[1].tags.find(t => t.endsWith('Tense')) ?? 'Present').find(c => c.pronoun === 'je')!.verb}`;
        } else {
          conjugated = `il ${conj.findTense(verbInfinitive, result.terms[1].tags.find(t => t.endsWith('Tense')) ?? 'Present').find(c => c.pronoun === 'il')!.verb}`;
        }
        break;
      case 'il':
        conjugated = `il ${conj.findTense(verbInfinitive, result.terms[1].tags.find(t => t.endsWith('Tense')) ?? 'Present').find(c => c.pronoun === 'il')!.verb}`;
        break;
      case 'elle':
        conjugated = `elle ${conj.findTense(verbInfinitive, result.terms[1].tags.find(t => t.endsWith('Tense')) ?? 'Present').find(c => c.pronoun === 'il')!.verb}`;
        break;
      case 'on':
        conjugated = `on ${conj.findTense(verbInfinitive, result.terms[1].tags.find(t => t.endsWith('Tense')) ?? 'Present').find(c => c.pronoun === 'il')!.verb}`;
        break;
      case 'ça':
        conjugated = `ça ${conj.findTense(verbInfinitive, result.terms[1].tags.find(t => t.endsWith('Tense')) ?? 'Present').find(c => c.pronoun === 'il')!.verb}`;
        break;
      case 'nous':
        conjugated = `nous ${conj.findTense(verbInfinitive, result.terms[1].tags.find(t => t.endsWith('Tense')) ?? 'Present').find(c => c.pronoun === 'nous')!.verb}`;
        break;
      case 'vous':
        conjugated = `on ${conj.findTense(verbInfinitive, result.terms[1].tags.find(t => t.endsWith('Tense')) ?? 'Present').find(c => c.pronoun === 'il')!.verb}`;
        break;
      case 'ils':
        conjugated = `ils ${conj.findTense(verbInfinitive, result.terms[1].tags.find(t => t.endsWith('Tense')) ?? 'Present').find(c => c.pronoun === 'ils')!.verb}`;
        break;
      case 'elles':
        conjugated = `elles ${conj.findTense(verbInfinitive, result.terms[1].tags.find(t => t.endsWith('Tense')) ?? 'Present').find(c => c.pronoun === 'ils')!.verb}`;
        break;
      default:
        conjugated = '';
        break;
    }

    const infinitiveVerb = result.terms.find(t => t.tags.includes('Infinitive'))?.text ?? '';

    return (`${conjugated} ${infinitiveVerb} feur ${replySuffix}${suffixes[Math.floor(Math.random() * suffixes.length)]}`).trim().replaceAll('  ', ' ').replace(' ,', ',');
  }
}
