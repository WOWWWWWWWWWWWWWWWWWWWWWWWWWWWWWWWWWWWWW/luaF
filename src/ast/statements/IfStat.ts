import { Block, Expression, Statement } from "@ast/Base"
import { Options } from "@utils/Context"
import { Token, TokenTree, TokenType } from "@ast/Token"

export class ElseClause {
	constructor(public condition: Expression | undefined, public body: Block) {}

	assemble(): TokenTree[] {
		return [
			...(this.condition
				? [
						new Token(TokenType.Keyword, "elseif"),
						this.condition.assemble(),
						new Token(TokenType.Keyword, "then")
				  ]
				: [new Token(TokenType.Keyword, "else")]),
			this.body.assemble()
		]
	}
}

export class IfStat extends Statement {
	constructor(
		options: Options,
		public condition: Expression,
		public body: Block,
		public elseClauses: ElseClause[]
	) {
		super(options)
	}

	assemble(): TokenTree[] {
		return [
			new Token(TokenType.Keyword, "if"),
			this.condition.assemble(),
			new Token(TokenType.Keyword, "then"),
			this.body.assemble(),
			this.elseClauses.map((ec) => ec.assemble()),
			new Token(TokenType.Keyword, "end")
		]
	}
}
