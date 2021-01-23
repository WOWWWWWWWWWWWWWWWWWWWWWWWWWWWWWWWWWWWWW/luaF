import { Expression } from "../Base.ts";
import { Token, TokenTree, TokenType } from "../Token.ts";

export default class BooleanLiteral extends Expression {
    value: boolean

    constructor(value: boolean) {
        super()
        this.value = value
    }

    assemble(): TokenTree[] {
        return [
            new Token(TokenType.Keyword, this.value ? "true" : "false")
        ]
    }
}