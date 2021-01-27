import { Block, Expression } from "@ast/Base"
import { BinopExpr } from "@ast/expressions/BinopExpr"
import { StringLiteral } from "@ast/expressions/StringLiteral"
import { VariableExpr } from "@ast/expressions/VariableExpr"
import { LocalVarStat } from "@ast/statements/LocalVarStat"
import { Token, TokenType } from "@ast/Token"
import { random } from "@utils/random"
import { Walker } from "@utils/Walker"

// https://stackoverflow.com/questions/22752781/javascript-split-array-into-groups-with-random-number-of-objects
function randChunkSplit(str: string, min: number, max: number): string[] {
	const arr = str.split("")

	const arrs = []
	let size = 1

	while (arr.length > 0) {
		size = Math.min(max, random(min, max))
		arrs.push(arr.splice(0, size))
	}

	return arrs.map((sub) => sub.join(""))
}

export default function (root: Block): Block {
	const visitor = new Walker()
	let i = 0

	visitor.stringLiteral = {
		leave: (expr, stat, block) => {
			const opts = stat.options.splitStrings
			if (opts.enabled && expr.value.length > opts.min) {
				// for when we want to insert an assignment
				let statementIndex = block.stats.indexOf(stat)

				const chunks = randChunkSplit(expr.value, opts.min, opts.max)

				const first = chunks.shift()
				if (!first) throw new Error("Nothing in chunks array.")

				let newExpr: Expression = new StringLiteral(first, expr.openingQuote)

				while (chunks.length > 0) {
					if (Math.random() < 0.49) {
						// probability that a new variable won't be created
						const shifted = chunks.shift()
						if (!shifted)
							throw new Error(
								"Checked that array is not empty but `shift` returned undefined."
							)

						newExpr = new BinopExpr(
							newExpr,
							new Token(TokenType.Symbol, ".."),
							new StringLiteral(shifted, expr.openingQuote)
						)
					} else {
						// Insert local var assignment
						const ident = new Token(TokenType.Ident, `__ss${i++}`)

						block.stats.splice(
							statementIndex++,
							0,
							new LocalVarStat(stat.options, [ident], [newExpr])
						)

						newExpr = new VariableExpr(ident)
					}
				}

				return newExpr
			}
		}
	}

	visitor.traverse(root)
	return root
}
