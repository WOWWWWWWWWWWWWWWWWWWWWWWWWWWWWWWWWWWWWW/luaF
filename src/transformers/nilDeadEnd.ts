import { Block } from "@ast/Base"
import { VariableExpr } from "@ast/expressions/VariableExpr"
import { Token, TokenType } from "@ast/Token"
import { Walker } from "@utils/Walker"

export default function (root: Block): Block {
	const visitor = new Walker()

	console.log("doing nilDeadEnd transformer")
	let i = 0
	visitor.nilLiteral = {
		leave: (_, stat) => {
			if (stat.options.nilDeadEnd.enabled) {
				return new VariableExpr(new Token(TokenType.Ident, `_${i++}_nil`))
			}
		}
	}

	visitor.traverse(root)
	return root
}
