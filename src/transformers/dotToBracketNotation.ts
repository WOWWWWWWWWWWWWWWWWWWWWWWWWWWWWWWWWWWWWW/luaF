import { Block } from "@ast/Base"
import { IndexExpr } from "@ast/expressions/IndexExpr"
import { StringLiteral } from "@ast/expressions/StringLiteral"
import { TableField, TableIndex } from "@ast/expressions/TableLiteral"
import { Walker } from "@utils/Walker"

export default function (root: Block): Block {
	console.log("doing dotToBracketNotation transformer")

	const visitor = new Walker()

	visitor.fieldExpr = {
		leave: (expr, stat) => {
			if (stat.options.dotToBracketNotation.enabled) {
				return new IndexExpr(
					expr.base,
					new StringLiteral(expr.field.source, '"')
				)
			}
		}
	}

	visitor.tableLiteral = {
		leave: (expr, stat) => {
			if (stat.options.dotToBracketNotation.enabled) {
				expr.entryList = expr.entryList.map((e) => {
					if (e instanceof TableField) {
						return new TableIndex(
							new StringLiteral(e.field.source, '"'),
							e.value
						)
					}
					return e
				})
			}
		}
	}

	visitor.traverse(root)
	return root
}
