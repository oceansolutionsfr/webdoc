import * as fs from "fs"
import {WebDoc} from "../src/webdoc.js"

const content = fs.readFileSync("./lib/oceans.utils.js", "utf-8")
const webdoc = new WebDoc(content)
webdoc.parse()

console.log(webdoc.render())
