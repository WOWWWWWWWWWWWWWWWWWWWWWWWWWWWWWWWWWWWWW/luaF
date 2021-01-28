import "@extensions/Array"

let getMapping: (index: number) => number
{
	const range = [...Array(500).keys()]

	const s1 = range.slice(0, 255)
	s1.shuffle()

	const s2 = range.slice(255)
	s2.shuffle()

	const mapping = s1.concat(s2)

	getMapping = (index: number) => mapping[index]
}

export default function indexToVarName(
	index: number,
	increment: boolean
): string {
	if (!increment) index = getMapping(index)
	return index.toString(2).replace(/0/g, "l").replace(/1/g, "I")
}
