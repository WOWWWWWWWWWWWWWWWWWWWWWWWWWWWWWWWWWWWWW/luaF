import { Expression } from "../Base.ts";
import { Token, TokenTree, TokenType } from "../Token.ts";

export class NumberLiteral extends Expression {
    value: number

    constructor(value: number) {
        super()
        this.value = value
    }

    static fromToken(token: Token) {
        return new NumberLiteral(
            parseFloat(token.source)
        )
    }

    toToken() {
        return new Token(
            TokenType.Number,
            this.value.toString().replace(/^0\./, ".")
        )
    }

    assemble(): TokenTree[] {
        return [
            this.toToken()
        ]
    }
}