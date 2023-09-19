import { Message } from "discord.js";
import Detector from "./Detector";
import compromise from 'fr-compromise'
import conj from 'conjugation-fr'
import { cleanMessageContent } from "../utils/strings";

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

const suffixes: Array<string> = [
  ', mon gars',
  ', mec',
  ", je crois",
  ...Array(10).fill('')
]

export default class SuffixPrefixDetector extends Detector {
  protected async createSpecificReply(message: Message): Promise<string | null> {
    const reference = await message.fetchReference().catch(() => null)
    const isSelfTarget = (reference && reference.author.id === message.client.user.id) ?? false

    console.log(compromise(cleanMessageContent(message).toLowerCase()).json());

    const compromiseMatch = compromise(cleanMessageContent(message).toLowerCase()).match(`[<prefix>(!quoi){0,2} (#Verb|faire)? #Preposition?] quoi [<suffix2prefix>#Verb]? [<suffix>(#Determiner !quoi|!quoi)?]?$`)

    if (compromiseMatch == null || compromiseMatch.length === 0) {
      return null
    }

    return this.conjugateResponse(compromiseMatch, isSelfTarget)
  }

  conjugateResponse(compromiseMatch: any, isSelfTarget: boolean = false): string {
    const parsed = compromiseMatch.json() as CompromiseResult[]

    const result = parsed[0]

    const replyPrefix = trimPrefix((compromiseMatch.groups('prefix') as any)?.text().trim() ?? '')
    const replysuffixToPrefix = (compromiseMatch.groups('suffix2prefix') as any)?.text().trim() ?? ''
    const replySuffix = (compromiseMatch.groups('suffix') as any)?.text().trim() ?? ''

    if (result == null) {
      return '';
    }

    return (`${replyPrefix} ${replysuffixToPrefix} feur ${replySuffix.length > 0 ? ` ${replySuffix}` : ''}${suffixes[Math.floor(Math.random() * suffixes.length)]}`).trim().replaceAll('  ', ' ').replace(' ,', ',');
  }
}

function trimPrefix(prefix: string) {
  return (prefix
    .split(/(?=(?:ç|c)a)/).at(-1) ?? '') // Splitting on 'ça' or 'ca' and taking the last part
    .trim() // Trimming the result
}
