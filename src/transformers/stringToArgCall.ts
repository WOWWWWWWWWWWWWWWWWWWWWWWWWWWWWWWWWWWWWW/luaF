import { Block } from "@ast/Base"
import { ArgCall } from "@ast/expressions/CallExpr"
import { StringLiteral } from "@ast/expressions/StringLiteral"
import { Walker } from "@utils/Walker"

export default function (root: Block): Block {
	console.log("doing stringToArgCall transformer")

	const visitor = new Walker()

	visitor.stringCall = {
		leave: (expr, stat) => {
			const opt = stat.options.stringToArgCall

			if (opt && opt.enabled) {
				return new ArgCall(expr.base, [StringLiteral.fromToken(expr.arg)])
			}
		}
	}

	visitor.traverse(root)
	return root
}
