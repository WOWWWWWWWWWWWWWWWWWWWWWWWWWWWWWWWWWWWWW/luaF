// Here's a little fun fact,
// comparing strings in JS is exactly the same as Lua.
// 'abc' > 'bbc' -> true
// The sample above takes only the first letter of each and
// compares their codepoint.

import { Block, Expression } from "@ast/Base"
import { BinopExpr } from "@ast/expressions/BinopExpr"
import { NumberLiteral } from "@ast/expressions/NumberLiteral"
import { ParenExpr } from "@ast/expressions/ParenExpr"
import { StringLiteral } from "@ast/expressions/StringLiteral"
import { Token, TokenType } from "@ast/Token"
import { chance, random, randomUTFString } from "@utils/random"
import { Walker } from "@utils/Walker"

const randomQuote = () => (chance(0.5) ? '"' : "'")
const truncate = (n: number): number => parseFloat(n.toPrecision(random(1, 5)))

function createCondition(out: boolean): BinopExpr {
	let lhs: StringLiteral | NumberLiteral
	let rhs: StringLiteral | NumberLiteral

	if (chance(0.5)) {
		lhs = new NumberLiteral(truncate(Math.random() * 10000))
		rhs = new NumberLiteral(truncate(Math.random() * 10000))
	} else {
		lhs = new StringLiteral(randomUTFString(random(0, 10)), randomQuote())
		rhs = new StringLiteral(randomUTFString(random(0, 10)), randomQuote())
	}

	const createExpr = (op: string) =>
		new BinopExpr(lhs, new Token(TokenType.Symbol, op), rhs)

	const possibilities: [boolean, BinopExpr][] = [
		[lhs.value > rhs.value, createExpr(">")],
		[lhs.value < rhs.value, createExpr("<")],

		[lhs.value >= rhs.value, createExpr(">=")],
		[lhs.value <= rhs.value, createExpr("<=")],

		[lhs.value != rhs.value, createExpr("~=")],
		[lhs.value == rhs.value, createExpr("==")]
	]

	possibilities.shuffle()

	const result = possibilities.find((p) => p[0] == out)
	if (!result) throw new Error("Cannot find a condition for boolean " + out)
	return result[1]
}

class Ternary {
	condition: Expression
	lhs: Expression
	rhs: Expression

	constructor(condition: Expression, lhs: Expression, rhs: Expression) {
		this.condition = condition
		this.lhs = lhs
		this.rhs = rhs
	}

	unwrap(): BinopExpr {
		return new BinopExpr(
			new BinopExpr(
				this.condition,
				new Token(TokenType.Keyword, "and"),
				this.lhs
			),
			new Token(TokenType.Keyword, "or"),
			this.rhs
		)
	}
}

function createTernary(
	cycleProbability: number,
	correct: Expression
): ParenExpr {
	let result: Ternary
	if (chance(0.5)) {
		result = new Ternary(
			createCondition(true),
			correct,
			new StringLiteral(randomUTFString(), randomQuote())
		)
	} else {
		result = new Ternary(
			createCondition(false),
			new StringLiteral(randomUTFString(), randomQuote()),
			correct
		)
	}

	if (chance(cycleProbability))
		result.lhs = createTernary(cycleProbability, result.lhs)
	if (chance(cycleProbability))
		result.rhs = createTernary(cycleProbability, result.rhs)

	return new ParenExpr(result.unwrap())
}

export default function (root: Block): Block {
	console.log("doing charToTernary transformer")

	const visitor = new Walker()

	visitor.stringLiteral = {
		leave: (expr, stat) => {
			const opts = stat.options.charToTernary
			if (opts.enabled && expr.value.length == 1 && chance(opts.freq)) {
				return createTernary(opts.cycleProbability, expr)
			}
		}
	}

	visitor.traverse(root)
	return root
}
