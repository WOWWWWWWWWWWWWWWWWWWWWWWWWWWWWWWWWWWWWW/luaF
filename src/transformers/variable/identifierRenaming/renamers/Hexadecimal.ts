// dynamic mapping since the possibilities are so large
const getMapping = (() => {
    const indexToMapping: Record<number, number> = {}
    const mappingSet: Set<number> = new Set()

    return (index: number) => {
        if (indexToMapping[index]) // Check if the index has a map
            return indexToMapping[index]

        let newMapping: number;
        do {
            newMapping = Math.random() * (16 ^ 8)
        } while (mappingSet.has(newMapping))

        indexToMapping[index] = newMapping
        mappingSet.add(newMapping)

        return newMapping
    }
})()

export default function indexToVarName(index: number, increment: boolean) {
    if (!increment) index = getMapping(index)

    // deno-lint-ignore no-explicit-any
    return (("_0x" + index.toString(16)) as any).mock()
}