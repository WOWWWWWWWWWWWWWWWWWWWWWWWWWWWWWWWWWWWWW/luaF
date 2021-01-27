import { Block } from "@ast/Base"

import dotToBracketNotation from "./dotToBracketNotation"
import stringToArgCall from "./stringToArgCall"

import removeDuplicateLiterals from "./removeDuplicateLiterals"
import tweakNumberNotation from "./tweakNumberNotation"
import variableGrouping from "./variableGrouping"
import encodeStrings from "./encodeStrings"

export default [
	dotToBracketNotation,
	stringToArgCall,

	removeDuplicateLiterals,
	variableGrouping,
	tweakNumberNotation,
	encodeStrings
] as ((root: Block) => Block)[]
