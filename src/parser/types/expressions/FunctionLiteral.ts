import { assembleTokensWithCommas, Block, Expression } from "../Base.ts";
import { Token, TokenTree, TokenType } from "../Token.ts";

export class FunctionLiteral extends Expression {
    arglist: Token[]
    body: Block

    constructor(arglist: Token[], body: Block) {
        super()
        this.arglist = arglist
        this.body = body
    }

    assemble(): TokenTree[] {
        return [
            new Token(TokenType.Keyword, "function"),
            new Token(TokenType.Symbol, "("),
            assembleTokensWithCommas(this.arglist),
            new Token(TokenType.Symbol, ")"),
            this.body.assemble(),
            new Token(TokenType.Keyword, "end")
        ]
    }
}