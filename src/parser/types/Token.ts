export enum TokenType {
    Eof,
    String,
    Keyword,
    Ident,
    Number,
    Symbol
}

const BlockFollowKeyword = new Set(['else', 'elseif', 'until', 'end'])

const UnopSet = new Set(['-', 'not', '#'])
const BinopSet = new Set([
    '+', '-', '*', '/', '%', '^', '#',
    '..', '.', ':',
    '>', '<', '<=', '>=', '~=', '==',
    'and', 'or'
])

const rev = Object.keys(TokenType)
export class Token {
    type: TokenType
    source: string

    constructor(type: TokenType, source: string) {
        this.type = type
        this.source = source
    }

    public toString() {
        return `<${this.readableType()} \`${this.source}\`>`
    }

    private readableType() {
        return rev[this.type]
    }
}

export class StreamedToken extends Token {
    leadingWhite: string

    constructor(type: TokenType, source: string, leadingWhite: string) {
        super(type, source)
        this.leadingWhite = leadingWhite
    }

    public isBlockFollow(): boolean {
        return this.type == TokenType.Eof || (this.type == TokenType.Keyword && BlockFollowKeyword.has(this.source))
    }

    public isBinop(): boolean {
        return BinopSet.has(this.source)
    }

    public isUnop(): boolean {
        return UnopSet.has(this.source)
    }

    // TODO: Create annotations
    // deno-lint-ignore no-explicit-any
    context(context: any): StreamedToken {
        return this;
    }

    strip(): Token {
        return new Token(this.type, this.source)
    }
}

export type TokenTree = Token | TokenTree[]