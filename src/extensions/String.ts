import { chance } from "@utils/random"

// Random upper and lowercase
String.prototype.mock = function () {
	return this.split("")
		.map((c) => (chance(0.5) ? c.toLowerCase() : c.toUpperCase()))
		.join("")
}
