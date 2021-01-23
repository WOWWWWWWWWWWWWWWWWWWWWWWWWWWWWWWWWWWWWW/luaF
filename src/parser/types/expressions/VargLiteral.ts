import { Expression } from "../Base.ts";
import { Token, TokenTree, TokenType } from "../Token.ts";

export default class VargLiteral extends Expression {
    assemble(): TokenTree[] {
        return [
            new Token(TokenType.Symbol, "...")
        ]
    }
}