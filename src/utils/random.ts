export function random(min: number, max: number): number {
	return Math.round(Math.random() * (max - min) + min)
}

export function chance(probability: number): boolean {
	return Math.random() < probability
}
