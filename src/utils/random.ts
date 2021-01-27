export function random(min: number, max: number): number {
	return Math.round(Math.random() * (max - min) + min)
}

export function chance(probability: number): boolean {
	return Math.random() < probability
}

export function randomUTFString(count = 1): string {
	return String.fromCharCode(
		...new Array(count).fill(0).map(() => random(32, 126))
	)
}
