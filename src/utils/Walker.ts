import { Node, Block, Statement, Expression } from "@ast/Base"

import { IfStat } from "@ast/statements/IfStat"
import { WhileStat } from "@ast/statements/WhileStat"
import { DoStat } from "@ast/statements/DoStat"
import { GenericForStat, NumericForStat } from "@ast/statements/ForStat"
import { RepeatStat } from "@ast/statements/RepeatStat"
import { FunctionStat } from "@ast/statements/FunctionStat"
import { LocalVarStat } from "@ast/statements/LocalVarStat"
import { ReturnStat } from "@ast/statements/ReturnStat"
import { BreakStat } from "@ast/statements/BreakStat"
import { CallExprStat } from "@ast/statements/CallExprStat"
import { AssignmentStat } from "@ast/statements/AssignmentStat"
import { BinopExpr } from "@ast/expressions/BinopExpr"
import { UnopExpr } from "@ast/expressions/UnopExpr"
import { NumberLiteral } from "@ast/expressions/NumberLiteral"
import { StringLiteral } from "@ast/expressions/StringLiteral"
import { NilLiteral } from "@ast/expressions/NilLiteral"
import { BooleanLiteral } from "@ast/expressions/BooleanLiteral"
import { VargLiteral } from "@ast/expressions/VargLiteral"
import { FieldExpr } from "@ast/expressions/FieldExpr"
import { IndexExpr } from "@ast/expressions/IndexExpr"
import { ArgCall, StringCall, TableCall } from "@ast/expressions/CallExpr"
import { FunctionLiteral } from "@ast/expressions/FunctionLiteral"
import { VariableExpr } from "@ast/expressions/VariableExpr"
import { ParenExpr } from "@ast/expressions/ParenExpr"
import {
	TableField,
	TableIndex,
	TableLiteral,
	TableValue
} from "@ast/expressions/TableLiteral"

type IdentifiedStatement = Statement & { id?: number }

type VisitorFunction<T extends Node, A> = (
	node: T,
	...a: // https://stackoverflow.com/questions/52318011/optional-parameters-based-on-conditional-types
	T extends Block
		? []
		: T extends Statement
		? [block: Block]
		: T extends Expression
		? [statement: Statement, block: Block]
		: [unknown]
) => A | void

interface Visitor<T extends Node, A> {
	enter?: VisitorFunction<T, A>
	leave?: VisitorFunction<T, A>
}

export class Walker {
	traverse(root: Block): Block {
		return this._root(root)
	}

	root: Visitor<Block, Block> = {}
	block: Visitor<Block, Block> = {}
	statement: Visitor<Statement, Statement> = {}

	ifStat: Visitor<IfStat, Statement> = {}
	whileStat: Visitor<WhileStat, Statement> = {}
	doStat: Visitor<DoStat, Statement> = {}
	numericForStat: Visitor<NumericForStat, Statement> = {}
	genericForStat: Visitor<GenericForStat, Statement> = {}
	repeatStat: Visitor<RepeatStat, Statement> = {}
	functionStat: Visitor<FunctionStat, Statement> = {}
	localVarStat: Visitor<LocalVarStat, Statement> = {}
	returnStat: Visitor<ReturnStat, Statement> = {}
	breakStat: Visitor<BreakStat, Statement> = {}
	callExprStat: Visitor<CallExprStat, Statement> = {}
	assignmentStat: Visitor<AssignmentStat, Statement> = {}

	binopExpr: Visitor<BinopExpr, Expression> = {}
	unopExpr: Visitor<UnopExpr, Expression> = {}
	numberLiteral: Visitor<NumberLiteral, Expression> = {}
	stringLiteral: Visitor<StringLiteral, Expression> = {}
	nilLiteral: Visitor<NilLiteral, Expression> = {}
	booleanLiteral: Visitor<BooleanLiteral, Expression> = {}
	vargLiteral: Visitor<VargLiteral, Expression> = {}
	variableExpr: Visitor<VariableExpr, Expression> = {}
	fieldExpr: Visitor<FieldExpr, Expression> = {}
	indexExpr: Visitor<IndexExpr, Expression> = {}
	argCall: Visitor<ArgCall, Expression> = {}
	stringCall: Visitor<StringCall, Expression> = {}
	tableCall: Visitor<TableCall, Expression> = {}
	functionLiteral: Visitor<FunctionLiteral, Expression> = {}
	parenExpr: Visitor<ParenExpr, Expression> = {}
	tableLiteral: Visitor<TableLiteral, Expression> = {}

	private visit<T extends Node, A>(
		visitor: Visitor<T, A>,
		mutate: (out: A) => T | void
	): [enter: VisitorFunction<T, A>, leave: VisitorFunction<T, A>] {
		return [
			(...a) => {
				if (visitor.enter) {
					const out = visitor.enter(...a)
					if (out) mutate(out)
				}
			},
			(...a) => {
				if (visitor.leave) {
					const out = visitor.leave(...a)
					if (out) mutate(out)
				}
			}
		]
	}

	private _root(root: Block): Block {
		const [enter, leave] = this.visit(this.root, (b) => (root = b))

		enter(root)
		this._block(root)
		leave(root)

		return root
	}

	identifier = 0
	private _block(block: Block) {
		const [benter, bleave] = this.visit(this.block, (b) => (block = b))

		benter(block)

		let i = 0
		while (block.stats.length - i > 0) {
			let newStatement = block.stats[i]

			// statements may be added, so we assign an identifier so we know where this statement's new index is
			const oldStatement: IdentifiedStatement = block.stats[i]

			const id = ++this.identifier
			oldStatement.id = id

			const [senter, sleave] = this.visit(
				this.statement,
				(s) => (newStatement = s)
			)

			senter(newStatement, block)

			const out = this._statement(newStatement, block)
			if (out !== undefined) {
				newStatement = out
			}

			sleave(newStatement, block)

			// Visitor may have inserted new statements, so we find the identifier
			const newIndex = block.stats.findIndex(
				(idStat: IdentifiedStatement) => idStat.id == id
			)

			if (newIndex == -1)
				throw new Error(`Could not find statement with identifier ${id}`)

			// Delete the identifier
			delete oldStatement.id

			block.stats[newIndex] = newStatement // replace the statement
			i = newIndex + 1 // advance i to after the newIndex
		}

		bleave(block)

		return block
	}

	_statement(statement: Statement, block: Block): Statement {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		let visitor: Visitor<any, Statement> | undefined

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		let visitChildren: ((statement: any, block: Block) => void) | undefined

		if (statement instanceof IfStat) {
			visitor = this.ifStat
			visitChildren = this._ifStat
		} else if (statement instanceof WhileStat) {
			visitor = this.whileStat
			visitChildren = this._whileStat
		} else if (statement instanceof DoStat) {
			visitor = this.doStat
			visitChildren = this._doStat
		} else if (statement instanceof NumericForStat) {
			visitor = this.numericForStat
			visitChildren = this._numericForStat
		} else if (statement instanceof GenericForStat) {
			visitor = this.genericForStat
			visitChildren = this._genericForStat
		} else if (statement instanceof RepeatStat) {
			visitor = this.repeatStat
			visitChildren = this._repeatStat
		} else if (statement instanceof FunctionStat) {
			visitor = this.functionStat
			visitChildren = this._functionStat
		} else if (statement instanceof LocalVarStat) {
			visitor = this.localVarStat
			visitChildren = this._localVarStat
		} else if (statement instanceof ReturnStat) {
			visitor = this.returnStat
			visitChildren = this._returnStat
		} else if (statement instanceof BreakStat) {
			visitor = this.breakStat
			// Nothing to visit
		} else if (statement instanceof CallExprStat) {
			visitor = this.callExprStat
			visitChildren = this._callExprStat
		} else if (statement instanceof AssignmentStat) {
			visitor = this.assignmentStat
			visitChildren = this._assignmentStat
		}

		if (visitor) {
			const [enter, leave] = this.visit(visitor, (s) => (statement = s))
			enter(statement, block)

			if (visitChildren) visitChildren.call(this, statement, block)

			leave(statement, block)
		} else {
			throw Error("Foreign statement detected")
		}

		return statement
	}

	_expression(
		expression: Expression,
		statement: Statement,
		block: Block
	): Expression {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		let visitor: Visitor<any, Expression> | undefined

		let visitChildren: // eslint-disable-next-line @typescript-eslint/no-explicit-any
		((expression: any, statement: Statement, block: Block) => void) | undefined

		if (expression instanceof BinopExpr) {
			visitor = this.binopExpr
			visitChildren = this._binopExpr
		} else if (expression instanceof UnopExpr) {
			visitor = this.unopExpr
			visitChildren = this._unopExpr
		} else if (expression instanceof NumberLiteral) {
			visitor = this.numberLiteral
		} else if (expression instanceof StringLiteral) {
			visitor = this.stringLiteral
		} else if (expression instanceof NilLiteral) {
			visitor = this.nilLiteral
		} else if (expression instanceof BooleanLiteral) {
			visitor = this.booleanLiteral
		} else if (expression instanceof VargLiteral) {
			visitor = this.vargLiteral
		} else if (expression instanceof VariableExpr) {
			visitor = this.variableExpr
		} else if (expression instanceof FieldExpr) {
			visitor = this.fieldExpr
			visitChildren = this._fieldExpr
		} else if (expression instanceof IndexExpr) {
			visitor = this.indexExpr
			visitChildren = this._indexExpr
		} else if (expression instanceof ArgCall) {
			visitor = this.argCall
			visitChildren = this._argCall
		} else if (expression instanceof StringCall) {
			visitor = this.stringCall
			visitChildren = this._stringCall
		} else if (expression instanceof TableCall) {
			visitor = this.tableCall
			visitChildren = this._tableCall
		} else if (expression instanceof FunctionLiteral) {
			visitor = this.functionLiteral
			visitChildren = this._functionLiteral
		} else if (expression instanceof ParenExpr) {
			visitor = this.parenExpr
			visitChildren = this._parenExpr
		} else if (expression instanceof TableLiteral) {
			visitor = this.tableLiteral
			visitChildren = this._tableLiteral
		}

		if (visitor) {
			const [enter, leave] = this.visit(visitor, (s) => (expression = s))
			enter(expression, statement, block)

			if (visitChildren) visitChildren.call(this, expression, statement, block)

			leave(expression, statement, block)
		} else {
			throw Error("Foreign expression detected")
		}

		return expression
	}

	private _ifStat(statement: IfStat, block: Block) {
		statement.condition = this._expression(
			statement.condition,
			statement,
			block
		)
		statement.body = this._block(statement.body)

		for (let i = 0; i < statement.elseClauses.length; i++) {
			const elseClause = statement.elseClauses[i]

			if (elseClause.condition)
				statement.elseClauses[i].condition = this._expression(
					elseClause.condition,
					statement,
					block
				)
			statement.elseClauses[i].body = this._block(elseClause.body)
		}
	}

	private _whileStat(statement: WhileStat, block: Block) {
		statement.condition = this._expression(
			statement.condition,
			statement,
			block
		)
		statement.body = this._block(statement.body)
	}

	private _doStat(statement: DoStat) {
		statement.body = this._block(statement.body)
	}

	private _numericForStat(statement: NumericForStat, block: Block) {
		statement.rangelist = statement.rangelist.map((e) =>
			this._expression(e, statement, block)
		)
		statement.body = this._block(statement.body)
	}

	private _genericForStat(statement: GenericForStat, block: Block) {
		statement.generatorlist = statement.generatorlist.map((e) =>
			this._expression(e, statement, block)
		)
		statement.body = this._block(statement.body)
	}

	private _repeatStat(statement: RepeatStat, block: Block) {
		statement.body = this._block(statement.body)
		statement.condition = this._expression(
			statement.condition,
			statement,
			block
		)
	}

	private _functionStat(statement: FunctionStat) {
		statement.body = this._block(statement.body)
	}

	private _localVarStat(statement: LocalVarStat, block: Block) {
		statement.rhs = statement.rhs.map((e) =>
			this._expression(e, statement, block)
		)
	}

	private _returnStat(statement: ReturnStat, block: Block) {
		statement.list = statement.list.map((e) =>
			this._expression(e, statement, block)
		)
	}

	private _callExprStat(statement: CallExprStat, block: Block) {
		statement.expr = this._expression(statement.expr, statement, block)
	}

	private _assignmentStat(statement: AssignmentStat, block: Block) {
		statement.lhs = statement.lhs.map((e) =>
			this._expression(e, statement, block)
		)
		statement.rhs = statement.rhs.map((e) =>
			this._expression(e, statement, block)
		)
	}

	// Expressions

	private _binopExpr(
		expression: BinopExpr,
		statement: Statement,
		block: Block
	) {
		expression.lhs = this._expression(expression.lhs, statement, block)
		expression.rhs = this._expression(expression.rhs, statement, block)
	}

	private _unopExpr(expression: UnopExpr, statement: Statement, block: Block) {
		expression.base = this._expression(expression.base, statement, block)
	}

	private _fieldExpr(
		expression: FieldExpr,
		statement: Statement,
		block: Block
	) {
		expression.base = this._expression(expression.base, statement, block)
	}

	private _indexExpr(
		expression: IndexExpr,
		statement: Statement,
		block: Block
	) {
		expression.base = this._expression(expression.base, statement, block)
		expression.index = this._expression(expression.index, statement, block)
	}

	private _argCall(expression: ArgCall, statement: Statement, block: Block) {
		expression.base = this._expression(expression.base, statement, block)
		expression.arguments = expression.arguments.map((e) =>
			this._expression(e, statement, block)
		)
	}

	private _stringCall(
		expression: StringCall,
		statement: Statement,
		block: Block
	) {
		expression.base = this._expression(expression.base, statement, block)
	}

	private _tableCall(
		expression: TableCall,
		statement: Statement,
		block: Block
	) {
		expression.base = this._expression(expression.base, statement, block)

		const expr = <TableLiteral>(
			this._expression(expression.table, statement, block)
		)
		expression.table = expr
	}

	private _functionLiteral(expression: FunctionLiteral) {
		expression.body = this._block(expression.body)
	}

	private _parenExpr(
		expression: ParenExpr,
		statement: Statement,
		block: Block
	) {
		expression.value = this._expression(expression.value, statement, block)
	}

	private _tableLiteral(
		expression: TableLiteral,
		statement: Statement,
		block: Block
	) {
		for (let i = 0; i < expression.entryList.length; i++) {
			const element = expression.entryList[i]

			if (element instanceof TableField) {
				element.value = this._expression(element.value, statement, block)
			} else if (element instanceof TableIndex) {
				element.index = this._expression(element.index, statement, block)
				element.value = this._expression(element.value, statement, block)
			} else if (element instanceof TableValue) {
				element.value = this._expression(element.value, statement, block)
			}

			expression.entryList[i] = element
		}
	}
}
