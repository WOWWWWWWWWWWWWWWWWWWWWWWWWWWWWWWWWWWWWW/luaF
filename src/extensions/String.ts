// Random upper and lowercase
String.prototype.mock = function () {
	return this.split("")
		.map((c) => (Math.random() < 0.5 ? c.toLowerCase() : c.toUpperCase()))
		.join("")
}
