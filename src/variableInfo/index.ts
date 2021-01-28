import { Block, Statement } from "@ast/Base"
import { VariableExpr } from "@ast/expressions/VariableExpr"
import { TokenType } from "@ast/Token"
import { Walker } from "@utils/Walker"
import { Scope } from "./Scope"
import { Global, Local, LocalType, Variable } from "./Variable"

// Numbering generator for variable lifetimes
let locationGenerator = 0
export const markLocation = (): number => locationGenerator++

export function createVariableInfo(
	root: Block
): [globals: Global[], rootScope: Scope] {
	locationGenerator = 0
	let currentScope: Scope = new Scope(undefined)

	const globalVars: Global[] = []

	const pushScope = () => (currentScope = new Scope(currentScope))

	function popScope() {
		const scope = currentScope

		const endLocation = markLocation()

		// Mark where this scope ends
		scope.endLocation = endLocation

		// Mark all of the variables in the scope as ending there
		scope.variableList.forEach((v) => (v.scopeEndLocation = endLocation))

		if (scope.parentScope) {
			// Move to the parent scope
			currentScope = scope.parentScope
		}

		return scope
	}

	function getGlobalVar(name: string, stat: Statement | null) {
		const v = globalVars.find((v) => v.name == name)
		if (v) {
			return v
		} else {
			const global = new Global(name, stat?.options || null)
			globalVars.push(global)
			return global
		}
	}

	const visitor = new Walker()
	visitor.functionLiteral = {
		/*
            Function literal adds a new scope and adds the function literal arguments
            as local variables in the scope.
        */
		enter: (expr, stat) => {
			pushScope()
			expr.arglist.forEach((ident, index) => {
				if (ident.type == TokenType.Ident)
					currentScope.variableList.push(
						new Local(
							ident.source,
							stat.options,
							{
								type: LocalType.Argument,
								index: index
							},
							currentScope,
							(name) => (ident.source = name)
						)
					)
			})
		},
		leave: () => {
			popScope()
		}
	}

	visitor.variableExpr = {
		/*
            Variable expression references from existing local varibales
            in the current scope, annotating the variable usage with variable
            information.
        */
		enter: (expr) => {
			const name = expr.value.source
			const v: Variable =
				currentScope.getVariable(name) || getGlobalVar(name, null)

			v.reference((name) => (expr.value.source = name))
			expr.variable = v
		}
	}

	/*
        Ugly hack for repeat until statements. They use a statlist in their body,
        but we have to wait to pop that stat list until the until conditional
        expression has been visited rather than popping where the textual contents
        of the statlist actually end. (As is the case for all the other places a
        stat list can appear)
    */
	const skipPop: Map<Block, boolean> = new Map()
	visitor.block = {
		// Block adds a new scope
		enter: () => {
			pushScope()
		},
		leave: (block) => {
			skipPop.get(block) || popScope()
		}
	}

	visitor.localVarStat = {
		/*
            localVarStat adds the local variables to the current scope as locals
            We need to visit the subexpressions first, because these new locals
            will not be in scope for the initialization value expressions. That is:
              `local bar = bar + 1`
            Is valid code
        */
		leave: (stat) => {
			stat.lhs.forEach((ident, index) => {
				currentScope.variableList.push(
					new Local(
						ident.source,
						stat.options,
						{
							type: LocalType.Argument,
							index: index
						},
						currentScope,
						(name) => (ident.source = name)
					)
				)
			})
		}
	}

	visitor.functionStat = {
		enter: (stat) => {
			/* 
                Local function stat adds the function itself to the current scope as
                a local variable, and creates a new scope with the function arguments
                as local variables.
            */
			/* 
                Function stat adds a new scope containing the function arguments
                as local variables.
                A function stat may also assign to a global variable if it is in
                the form `function foo()` with no additional dots/colons in the
                name chain.
                **BUGFIX**: If `function foo()` is done when there is already a local
                variable `foo` in scope, it will assign to the local variable instead
                of a global one! I did not know this when writing it initially.
            */

			if (stat.local) {
				currentScope.variableList.push(
					new Local(
						stat.namechain[0].source,
						stat.options,
						{
							type: LocalType.LocalFunction
						},
						currentScope,
						(name) => (stat.namechain[0].source = name)
					)
				)
			} else {
				const name = stat.namechain[0].source
				const v: Variable =
					currentScope.getVariable(name) || getGlobalVar(name, stat)
				v.reference((name) => (stat.namechain[0].source = name))
				v.assignedTo = true
			}

			pushScope()

			// check if subliminal self is fit for declaration
			if (
				stat.namechain.find((t) => t.source == ":") &&
				!stat.arglist.find((arg) => arg.source == "self")
			) {
				currentScope.variableList.push(
					new Local(
						"self",
						stat.options,
						{
							type: LocalType.Subliminal
						},
						currentScope,
						// eslint-disable-next-line @typescript-eslint/no-empty-function
						() => {}
					)
				)
			}

			stat.arglist.forEach((ident, index) => {
				if (ident.type == TokenType.Ident)
					currentScope.variableList.push(
						new Local(
							ident.source,
							stat.options,
							{
								type: LocalType.Argument,
								index: index
							},
							currentScope,
							(name) => (ident.source = name)
						)
					)
			})
		},
		leave: () => {
			popScope()
		}
	}

	// TODO: Solve generator and range scope issue
	/*
        Quote:
        Fors need an extra scope holding the range variables
        Need a custom visitor so that the generator expressions can be
        visited before we push a scope, but the body can be visited
        after we push a scope.
    */

	visitor.genericForStat = {
		enter: (stat) => {
			pushScope()
			stat.varlist.forEach((ident, index) => {
				currentScope.variableList.push(
					new Local(
						ident.source,
						stat.options,
						{
							type: LocalType.ForRange,
							index: index
						},
						currentScope,
						(name) => (ident.source = name)
					)
				)
			})
		},
		leave: () => {
			popScope()
		}
	}

	visitor.numericForStat = {
		enter: (stat) => {
			pushScope()
			stat.varlist.forEach((ident, index) => {
				currentScope.variableList.push(
					new Local(
						ident.source,
						stat.options,
						{
							type: LocalType.ForRange,
							index: index
						},
						currentScope,
						(name) => (ident.source = name)
					)
				)
			})
		},
		leave: () => {
			popScope()
		}
	}

	visitor.repeatStat = {
		enter: (stat) => {
			/* 
                Extend the scope of the body statement up to the current point, that is
                up to the point *after* the until condition, since the body variables are
                still in scope through that condition.
                The SkipPop flag is used by visitor.StatList to accomplish this.
            */
			skipPop.set(stat.body, true)
		},
		leave: () => {
			// Now that the conditional exprssion has been visited, it's safe to pop the
			// body scope
			popScope()
		}
	}

	visitor.assignmentStat = {
		leave: (stat) => {
			// For an assignment statement we need to mark the
			// "assigned to" flag on variables.
			stat.lhs.forEach((expr) => {
				if (expr instanceof VariableExpr) {
					const name = expr.value.source
					const v: Variable =
						currentScope.getVariable(name) || getGlobalVar(name, stat)
					v.assignedTo = true
				}
			})
		}
	}

	visitor.traverse(root)

	return [globalVars, popScope()]
}
