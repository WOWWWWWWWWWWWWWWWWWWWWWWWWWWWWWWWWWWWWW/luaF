import { Expression } from "../Base.ts";
import { Token, TokenTree, TokenType } from "../Token.ts";

export class ParenExpr extends Expression {
    value: Expression

    constructor(value: Expression) {
        super()
        this.value = value
    }

    assemble(): TokenTree[] {
        return [
            new Token(TokenType.Symbol, "("),
            this.value.assemble(),
            new Token(TokenType.Symbol, ")")
        ]
    }
}