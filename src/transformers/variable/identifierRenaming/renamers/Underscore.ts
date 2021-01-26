import "../../../../extensions/Array.ts";

let getMapping: (index: number) => number;
{
    // Should not allocate for more than 200
    const range = [...Array(200).keys()]

    const s1 = range.slice(0, 50);
    s1.shuffle()

    const s2 = range.slice(50);
    s2.shuffle()

    const mapping = s1.concat(s2)

    getMapping = (index: number) => mapping[index]
}

export default function indexToVarName(index: number, increment: boolean) {
    if (!increment) index = getMapping(index)
    return "_".repeat(index + 1)
}