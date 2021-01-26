import { Block } from "@ast/Base"
import { Token, TokenTree } from "@ast/Token"

export function flatten(arr: TokenTree[]): Token[] {
	let res: Token[] = []
	for (const value of arr) {
		Array.isArray(value) ? (res = res.concat(flatten(value))) : res.push(value)
	}
	return res
}

export function print(root: Block): string {
	const tokens = flatten(root.assemble())
	const buffer: string[] = []

	for (let i = 0; i < tokens.length; i++) {
		const cur = tokens[i],
			nxt = tokens[i + 1]

		buffer.push(cur.source)

		if (nxt) {
			const lastCh = cur.source.slice(-1)
			const firstCh = nxt.source.charAt(0)

			if (/\w\w/.test(lastCh + firstCh)) {
				buffer.push(" ")
			}
		}
	}

	return buffer.join("")
}
