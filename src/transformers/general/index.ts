import { Block } from "@ast/Base"

import removeDuplicateLiterals from "./removeDuplicateLiterals"
import tweakNumberNotation from "./tweakNumberNotation"
import variableGrouping from "./variableGrouping"
import obnoxiousStringLiterals from "./obnoxiousStringLiterals"

export default [
	removeDuplicateLiterals,
	variableGrouping,
	tweakNumberNotation,
	obnoxiousStringLiterals
] as ((root: Block) => Block)[]
