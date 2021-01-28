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
import addParenthesis from "./addParenthesis"

export default [
	functionToAssignment,
	expandInvoke,
	globalToEnv,

	dotToBracketNotation,
	stringToArgCall,

	splitStrings,

	removeDuplicateLiterals,
	variableGrouping,

	charToTernary,

	tweakNumberNotation,
	encodeStrings,
	nilDeadEnd,

	addParenthesis,
	identifierRenaming
] as ((root: Block) => Block)[]
