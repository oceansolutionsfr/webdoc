import {WebDoc} from "../src/webdoc.js"


import * as fs from "fs"

const content = fs.readFileSync("./lib/oceans.utils.js", "utf-8")
const webdoc = new WebDoc(content)
webdoc.parse()

console.log(webdoc.stats())