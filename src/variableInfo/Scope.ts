import { markLocation } from "./index"
import { Local } from "./Variable"

export class Scope {
	parentScope: Scope | undefined
	childScopeList: Scope[] = []
	variableList: Local[] = []

	beginLocation: number
	endLocation: number | undefined

	depth = 1

	constructor(parentScope: Scope | undefined) {
		this.parentScope = parentScope
		this.beginLocation = markLocation()

		if (this.parentScope) {
			this.depth = this.parentScope.depth + 1
			this.parentScope.childScopeList.push(this)
		}
	}

	getVariable(name: string): Local | undefined {
		const self = [...this.variableList].reverse().find((v) => v.name == name)
		if (self) return self

		if (this.parentScope) {
			return this.parentScope.getVariable(name)
		}
	}
}
