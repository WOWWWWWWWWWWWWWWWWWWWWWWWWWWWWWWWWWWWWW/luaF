import { Block, Statement } from "@ast/Base"

let i = 0
type IdentifiedStatement = Statement & { id?: number }

export default function (statement: IdentifiedStatement, block: Block): number {
	const id = i++
	statement.id = id

	const index = block.stats.findIndex(
		(idStat: IdentifiedStatement) => idStat.id == id
	)
	delete statement.id
	return index
}
