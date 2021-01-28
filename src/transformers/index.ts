import { Block } from "@ast/Base"
import dotToBracketNotation from "./dotToBracketNotation"
import stringToArgCall from "./stringToArgCall"
import removeDuplicateLiterals from "./removeDuplicateLiterals"
import tweakNumberNotation from "./tweakNumberNotation"
import variableGrouping from "./variableGrouping"
import encodeStrings from "./encodeStrings"
import splitStrings from "./splitStrings"
import nilDeadEnd from "./nilDeadEnd"
import charToTernary from "./charToTernary"
import identifierRenaming from "./identifierRenaming"
import globalToEnv from "./globalToEnv"
import functionToAssignment from "./functionToAssignment"
import expandInvoke from "./expandInvoke"

export default [
	globalToEnv,
	functionToAssignment,
	expandInvoke,

	dotToBracketNotation,
	stringToArgCall,

	splitStrings,
	charToTernary,

	removeDuplicateLiterals,
	variableGrouping,

	tweakNumberNotation,
	encodeStrings,
	nilDeadEnd,

	identifierRenaming
] as ((root: Block) => Block)[]
