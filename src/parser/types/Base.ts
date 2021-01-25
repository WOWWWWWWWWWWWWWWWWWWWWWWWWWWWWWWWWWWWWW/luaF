import { Options } from "./Context.ts";
import { Token, TokenTree, TokenType } from "./Token.ts";

export abstract class Node {
    public abstract assemble(): TokenTree[];
}

export abstract class Expression extends Node { }

export abstract class Statement extends Node {
    options: Options

    constructor(options: Options) {
        super()
        this.options = options
    }
}

export function assembleWithCommas(list: Node[]): TokenTree[] {
    const res: TokenTree[] = []
    for (let i = 0; i < list.length; i++) {
        const b = list[i];
        res.push(b.assemble())
        res.push(new Token(TokenType.Symbol, ","))
    }
    res.pop()
    return res
}

export function assembleTokensWithCommas(list: Token[]): Token[] {
    const res: Token[] = []
    for (let i = 0; i < list.length; i++) {
        const b = list[i];
        res.push(b)
        res.push(new Token(TokenType.Symbol, ","))
    }
    res.pop()
    return res
}

const AmbiguousLast = new Set([')', ']'])
const AmbiguousFirst = new Set(['(', '[', '\'', '"', '{'])

function getLastToken(tree: TokenTree[]): Token {
    const o = tree[tree.length - 1]
    return Array.isArray(o) ? getLastToken(o) : o
}

function getFirstToken(tree: TokenTree[]): Token {
    const o = tree[0]
    return Array.isArray(o) ? getLastToken(o) : o
}

export class Block extends Node {
    stats: Statement[]
    options: Options

    constructor(stats: Statement[], options: Options) {
        super()
        this.stats = stats
        this.options = options
    }

    assemble(): TokenTree[] { // add semicolons to prevent ambiguous syntax
        const res: TokenTree[] = [];

        let prev: TokenTree[] | undefined;
        for (const cur of this.stats) {
            const tree = cur.assemble()
            if (prev) {
                const lastChar = getLastToken(prev).source.slice(-1)
                const firstChar = getFirstToken(tree).source.slice(0)
                if (AmbiguousLast.has(lastChar) && AmbiguousFirst.has(firstChar)) {
                    res.push(new Token(TokenType.Symbol, ";"))
                }
            }

            res.push(prev = tree)
        }

        return res;
    }
}