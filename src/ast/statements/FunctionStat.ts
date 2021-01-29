import { assembleTokensWithCommas, Block, Statement } from "@ast/Base"
import { Options } from "@utils/Context"
import { Token, TokenTree, TokenType } from "@ast/Token"

export class FunctionStat extends Statement {
	constructor(
		options: Options,
		public local: boolean,
		public namechain: Token[],
		public arglist: Token[],
		public body: Block
	) {
		super(options)
	}

	assemble(): TokenTree[] {
		return [
			...(this.local ? [new Token(TokenType.Keyword, "local")] : []),
			new Token(TokenType.Keyword, "function"),
			this.namechain,
			new Token(TokenType.Symbol, "("),
			assembleTokensWithCommas(this.arglist),
			new Token(TokenType.Symbol, ")"),
			this.body.assemble(),
			new Token(TokenType.Keyword, "end")
		]
	}
}
