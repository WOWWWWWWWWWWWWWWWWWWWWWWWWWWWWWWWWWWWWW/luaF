import { assembleTokensWithCommas, Block, Statement } from "@ast/Base"
import { Options } from "@utils/Context"
import { Token, TokenTree, TokenType } from "@ast/Token"

export class FunctionStat extends Statement {
	local: boolean
	namechain: Token[]
	arglist: Token[]
	body: Block

	constructor(
		options: Options,
		local: boolean,
		namechain: Token[],
		arglist: Token[],
		body: Block
	) {
		super(options)
		this.local = local
		this.namechain = namechain
		this.arglist = arglist
		this.body = body
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
