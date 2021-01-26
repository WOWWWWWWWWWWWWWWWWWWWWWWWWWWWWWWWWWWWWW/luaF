import "../../../../extensions/String.ts";

// dynamic mapping since the possibilities are so large
const getMapping = (() => {
    const indexToMapping: Record<number, number> = {}
    const mappingSet: Set<number> = new Set()

    const max = 16 ** 8
    return (index: number) => {
        if (indexToMapping[index]) // Check if the index has a map
            return indexToMapping[index]

        let newMapping: number;
        do {
            newMapping = Math.floor(Math.random() * max)
        } while (mappingSet.has(newMapping))

        indexToMapping[index] = newMapping
        mappingSet.add(newMapping)

        return newMapping
    }
})()

export default function indexToVarName(index: number, increment: boolean) {
    if (!increment) index = getMapping(index)

    return ("_0x" + index.toString(16)).mock()
}