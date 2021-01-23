import { Statement } from "../Base.ts";
import { Token, TokenTree, TokenType } from "../Token.ts";

export default class BreakStat extends Statement {
    assemble(): TokenTree[] {
        return [
            new Token(TokenType.Keyword, "break")
        ]
    }
}