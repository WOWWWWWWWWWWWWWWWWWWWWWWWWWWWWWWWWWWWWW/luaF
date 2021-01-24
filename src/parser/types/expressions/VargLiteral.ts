import { Expression } from "../Base.ts";
import { Token, TokenTree, TokenType } from "../Token.ts";

export class VargLiteral extends Expression {
    assemble(): TokenTree[] {
        return [
            new Token(TokenType.Symbol, "...")
        ]
    }
}