import { AllIdentStartChars, AllIdentChars } from "@utils/constants"
import "@extensions/Array"

let getMapping: (index: number) => number
{
	// Allocate for more than 2000..
	const range = [...Array(2000).keys()]

	const s1 = range.slice(0, 26)
	s1.shuffle()

	const s2 = range.slice(26)
	s2.shuffle()

	const mapping = s1.concat(s2)

	getMapping = (index: number) => mapping[index]
}

export default function indexToVarName(
	index: number,
	increment: boolean
): string {
	if (!increment) index = getMapping(index)

	const id = []

	{
		const d: number = index % AllIdentStartChars.length
		index = (index - d) / AllIdentStartChars.length
		id.push(AllIdentStartChars[d])
	}

	while (index > 0) {
		const d: number = index % AllIdentChars.length
		index = (index - d) / AllIdentChars.length
		id.push(AllIdentChars[d])
	}

	return id.join("")
}
