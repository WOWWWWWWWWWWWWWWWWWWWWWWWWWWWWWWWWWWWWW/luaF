import { Expression } from "../Base.ts";
import { Token, TokenTree, TokenType } from "../Token.ts";

export class StringLiteral extends Expression {
    value: string
    openingQuote: string

    constructor(value: string, openingQuote: string) {
        super()
        this.value = value
        this.openingQuote = openingQuote
    }

    static fromToken(token: Token) {
        const openingQuote = token.source.match(/'|"|\[=*\[/)?.[0]
        if (!openingQuote)
            throw new Error(`Invalid string \`${token.source}\` in StringLiteral.fromToken`);

        // Closing quote is always the same length as opening quote
        return new StringLiteral(
            token.source.slice(openingQuote.length, -openingQuote.length),
            openingQuote
        )
    }

    toToken() {
        return new Token(
            TokenType.String,
            this.openingQuote + this.value + this.getClosingQuote()
        )
    }

    getClosingQuote() {
        // All we really need to replace is the direction of the brackets
        return this.openingQuote.replaceAll("[", "]")
    }

    assemble(): TokenTree[] {
        return [
            this.toToken()
        ]
    }
}