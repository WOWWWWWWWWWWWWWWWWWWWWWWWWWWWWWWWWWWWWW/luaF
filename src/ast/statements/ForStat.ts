import {
	assembleTokensWithCommas,
	assembleWithCommas,
	Block,
	Expression,
	Statement
} from "@ast/Base"
import { Options } from "@utils/Context"
import { Token, TokenTree, TokenType } from "@ast/Token"

export class NumericForStat extends Statement {
	constructor(
		options: Options,
		public varlist: Token[],
		public rangelist: Expression[],
		public body: Block
	) {
		super(options)
	}

	assemble(): TokenTree[] {
		return [
			new Token(TokenType.Keyword, "for"),
			assembleTokensWithCommas(this.varlist),
			new Token(TokenType.Keyword, "="),
			assembleWithCommas(this.rangelist),
			new Token(TokenType.Keyword, "do"),
			this.body.assemble(),
			new Token(TokenType.Keyword, "end")
		]
	}
}

export class GenericForStat extends Statement {
	constructor(
		options: Options,
		public varlist: Token[],
		public generatorlist: Expression[],
		public body: Block
	) {
		super(options)
	}

	assemble(): TokenTree[] {
		return [
			new Token(TokenType.Keyword, "for"),
			assembleTokensWithCommas(this.varlist),
			new Token(TokenType.Keyword, "in"),
			assembleWithCommas(this.generatorlist),
			new Token(TokenType.Keyword, "do"),
			this.body.assemble(),
			new Token(TokenType.Keyword, "end")
		]
	}
}
