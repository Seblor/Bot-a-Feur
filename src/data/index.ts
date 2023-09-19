// @ts-ignore
import toInfinitiveJson from './toInfinitive.json'
// @ts-ignore
import verbsJson from './verbs.json'

const exampleVerb = { "label": "abader", "value": "abader", "obj": { "indicatif": { "présent": ["abade", "abades", "abade", "abadons", "abadez", "abadent"], "passé composé": ["abadé", "abadé", "abadé", "abadé", "abadé", "abadé"], "imparfait": ["abadais", "abadais", "abadait", "abadions", "abadiez", "abadaient"], "plus-que-parfait": ["abadé", "abadé", "abadé", "abadé", "abadé", "abadé"], "passé simple": ["abadai", "abadas", "abada", "abadâmes", "abadâtes", "abadèrent"], "passé antérieur": ["abadé", "abadé", "abadé", "abadé", "abadé", "abadé"], "futur simple": ["abaderai", "abaderas", "abadera", "abaderons", "abaderez", "abaderont"], "futur antérieur": ["abadé", "abadé", "abadé", "abadé", "abadé", "abadé"] }, "subjonctif": { "présent": ["abade", "abades", "abade", "abadions", "abadiez", "abadent"], "passé": ["abadé", "abadé", "abadé", "abadé", "abadé", "abadé"], "imparfait": ["abadasse", "abadasses", "abadât", "abadassions", "abadassiez", "abadassent"], "plus-que-parfait": ["abadé", "abadé", "abadé", "abadé", "abadé", "abadé"] }, "conditionnel": { "présent": ["abaderais", "abaderais", "abaderait", "abaderions", "abaderiez", "abaderaient"], "passé": ["abadé", "abadé", "abadé", "abadé", "abadé", "abadé"] }, "impératif": { "présent": ["abade", "abadons", "abadez"], "passé": ["abadé", "abadé", "abadé"] }, "infinitif": { "présent": ["abader"], "passé": ["abadé"] }, "participe": { "présent": ["abadant"], "passé": ["abadée", "abadé"] } } }

type Verb = typeof exampleVerb

export const toInfinitive  = toInfinitiveJson as Record<string, string>
export const verbs = verbsJson as Array<Verb>
