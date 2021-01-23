import { Token, TokenTree, TokenType } from "./Token.ts";

abstract class Base {
    public abstract assemble(): TokenTree[];
}

export abstract class TableEntry extends Base { }
export abstract class Expression extends Base { }
export abstract class Statement extends Base { }

export function assembleWithCommas(list: Base[]): TokenTree[] {
    const res: TokenTree[] = []
    list.forEach((b, i) => {
        res.push(b.assemble())
        if (i + 1 < list.length) {
            res.push(new Token(TokenType.Symbol, ","))
        }
    })
    return res
}

export function assembleTokensWithCommas(list: Token[]): Token[] {
    const res: Token[] = []
    list.forEach((b, i) => {
        res.push(b)
        if (i + 1 < list.length) {
            res.push(new Token(TokenType.Symbol, ","))
        }
    })
    return res
}

const AmbiguousLast = new Set([')', ']'])
const AmbiguousFirst = new Set(['(', '[', '\'', '"', '{'])

function getLastToken(tree: TokenTree[]): Token {
    let o = tree[tree.length - 1]
    return Array.isArray(o) ? getLastToken(o) : o
}

function getFirstToken(tree: TokenTree[]): Token {
    let o = tree[0]
    return Array.isArray(o) ? getLastToken(o) : o
}

export class Block extends Base {
    stats: Statement[]

    constructor(stats: Statement[]) {
        super()
        this.stats = stats
    }

    assemble(): TokenTree[] { // add semicolons to prevent ambiguous syntax
        const res: TokenTree[] = [];

        let prev: TokenTree[] | undefined;
        for (const cur of this.stats) {
            let tree = cur.assemble()
            if (prev) {
                let last_char = getLastToken(prev).source.slice(-1)
                let first_char = getFirstToken(tree).source.slice(0)
                if (AmbiguousLast.has(last_char) && AmbiguousFirst.has(first_char)) {
                    res.push(new Token(TokenType.Symbol, ";"))
                }
            }

            res.push(prev = tree)
        }

        return res;
    }
}


/*
type ValueOrArray<T> = T | ValueOrArray<T>[];
export function flatten<T>(arr: ValueOrArray<T>[]): T[] {
    const res: T[] = []
    for (const value of arr) {
        Array.isArray(value) ?
            res.concat(flatten(value)) :
            res.push(value)
    }
    return res
}
*/