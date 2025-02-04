import * as fs from "fs"
import {WebDoc} from "../src/webdoc.js"

const content = fs.readFileSync("./src/webdoc.js", "utf-8")
const webdoc = new WebDoc(content).parse().transform()

console.log(JSON.stringify(webdoc.document))
