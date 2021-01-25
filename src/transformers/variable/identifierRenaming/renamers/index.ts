import alphabet from './Alphabet.ts'
import underscore from './Underscore.ts'
import ugly from './Ugly.ts'
import hexadecimal from './Hexadecimal.ts'

export default {
    "alphabet": alphabet,
    "underscore": underscore,
    "ugly": ugly,
    "hexadecimal": hexadecimal
} as { [mode: string]: ((index: number, increment: boolean) => string) | undefined }