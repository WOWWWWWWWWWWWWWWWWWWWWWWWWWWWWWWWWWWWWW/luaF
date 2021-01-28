import alphabet from "./Alphabet"
import underscore from "./Underscore"
import ugly from "./Ugly"
import hexadecimal from "./Hexadecimal"

export default {
	alphabet: alphabet,
	underscore: underscore,
	ugly: ugly,
	hexadecimal: hexadecimal
} as {
	[mode: string]: ((index: number, increment: boolean) => string) | undefined
}
