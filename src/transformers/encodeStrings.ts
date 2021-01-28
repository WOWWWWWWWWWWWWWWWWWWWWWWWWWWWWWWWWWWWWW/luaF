import { Block } from "@ast/Base"
import { Walker } from "@utils/Walker"

export default function (root: Block): Block {
	console.log("doing encodeStrings transformer")

	const visitor = new Walker()

	visitor.stringLiteral = {
		leave: (expr, stat) => {
			if (stat.options.encodeStrings.enabled) {
				expr.openingQuote = '"'

				expr.formatValue = () =>
					expr.value
						.split("")
						.map((char: string) => {
							const codepoint = char.charCodeAt(0)
							if (codepoint < 256) return "\\" + codepoint
							return char
						})
						.join("")
			}
		}
	}

	visitor.traverse(root)
	return root
}
