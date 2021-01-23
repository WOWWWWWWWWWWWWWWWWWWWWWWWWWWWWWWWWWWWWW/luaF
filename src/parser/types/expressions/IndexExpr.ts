import { Expression } from "../Base.ts";
import { Token, TokenTree, TokenType } from "../Token.ts";

export default class IndexExpr extends Expression {
    base: Expression
    index: Expression

    constructor(base: Expression, index: Expression) {
        super()
        this.base = base
        this.index = index
    }

    assemble(): TokenTree[] {
        return [
            this.base.assemble(),
            new Token(TokenType.Symbol, "["),
            this.index.assemble(),
            new Token(TokenType.Symbol, "]")
        ];
    }
}