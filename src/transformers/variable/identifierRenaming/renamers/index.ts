import alphabet from './Alphabet.ts'
import underscore from './Underscore.ts'

// Allocate for more than 2000..
const range = [...Array(2000).keys()]


//
const s1 = range.slice(0, 26);
// deno-lint-ignore no-explicit-any
(s1 as any).shuffle()

const s2 = range.slice(26);
// deno-lint-ignore no-explicit-any
(s2 as any).shuffle()

const mapping = s1.concat(s2)

export function getMapping(index: number): number {
    return mapping[index]
}

export default {
    "alphabet": alphabet,
    "underscore": underscore
} as { [mode: string]: ((index: number) => string) | undefined }