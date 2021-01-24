import { Expression } from "../Base.ts";
import { Token, TokenTree, TokenType } from "../Token.ts";

export class NilLiteral extends Expression {
    assemble(): TokenTree[] {
        return [
            new Token(TokenType.Keyword, "nil")
        ]
    }
}