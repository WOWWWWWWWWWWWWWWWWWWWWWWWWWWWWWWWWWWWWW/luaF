export enum TokenType {
    Eof,
    String,
    Keyword,
    Ident,
    Number,
    Symbol
}

export class Token {
    type: TokenType
    source: string

    constructor(type: TokenType, source: string) {
        this.type = type
        this.source = source
    }
}

export class StreamedToken extends Token {
    leading_white: string

    constructor(type: TokenType, source: string, leading_white: string) {
        super(type, source)
        this.leading_white = leading_white
    }
}