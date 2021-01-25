const AllIdentStartChars = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i',
    'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r',
    's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I',
    'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R',
    'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '_']

const AllIdentChars = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i',
    'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r',
    's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I',
    'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R',
    'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', '_',
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9']

export default function indexToVarName(index: number) {
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