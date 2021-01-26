export const deepCopy = <T = Record<string, unknown>>(obj: T): T =>
	JSON.parse(JSON.stringify(obj))
