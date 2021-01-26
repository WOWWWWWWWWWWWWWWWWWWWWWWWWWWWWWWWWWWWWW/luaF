// Random upper and lowercase

import "./String.d.ts";

String.prototype.mock = function () {
    return this.split("").map(c => Math.random() < .5 ? c.toLowerCase() : c.toUpperCase()).join("")
}