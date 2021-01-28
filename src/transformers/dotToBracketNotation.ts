import { Block } from "@ast/Base"
import { IndexExpr } from "@ast/expressions/IndexExpr"
import { StringLiteral } from "@ast/expressions/StringLiteral"
import { Walker } from "@utils/Walker"

export default function (root: Block): Block {
	console.log("doing dotToBracketNotation transformer")

	const visitor = new Walker()

	visitor.fieldExpr = {
		leave: (expr, stat) => {
			if (stat.options.dotToBracketNotation.enabled) {
				expr.field.source = `"${expr.field.source}"`
				return new IndexExpr(expr.base, StringLiteral.fromToken(expr.field))
			}
		}
	}

	visitor.traverse(root)
	return root
}
