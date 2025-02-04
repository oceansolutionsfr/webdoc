/** @module webdoc.js @copyright (C) 2025 sebastien.mamy@gmail.com @license GNU General Public Licence v2 @disclaimer in no event shall the author be liable for any claim or damages. */



const clean = (str = "") => typeof str !== "string" ? null : str.replace(/\n/g, "").replace(/\\n/g, "").split('\\"').join('"').replace(/ +/g, " ").trim()


/** @class OObject @description a parent class with some utils attached */
class OObject {

    /** @property number @description the timestamp of the creation of the object */
    #timestamp = null

    /** @property string @description an unique enough UUID for the instance */
    #uuid = null

    /** @return OObject @description create an instance of OObject */
    constructor() {
        this.#timestamp = Date.now()
        this.#uuid = (parseInt((""+Math.random()).substring(2,16)+this.__timestamp)).toString(16)
    }

    /** @return object @description a json representation of some stats on the instance @param string mode expected output [json, string]*/
    stats(mode = "json") {
        if(mode === "json") return {
            class: this.constructor.name,
            id: this.#uuid,
            timestamp: this.#timestamp
        }
        const json = this.stats()
        return Object.keys(json).reduce((result, key) => {
            result += "  - " + key + ": " + json[key] + "\n"
            return result
        },"Object Instance\n")
    }
}

/** @class WebDoc @description manage documentation */
class WebDoc extends OObject {

    /** @property string @description name of the current container of a descriptor */
    #container_name = null
    
    /** @property array @description contains the descriptor of javascript element {line: string, next_line: line, position: number} */
    descriptors = []

    /** @property object @description the object containing the result of the parsing */
    document = null
    
    /** @property array @description the array containing all the parsing errors */
    errors = []

    /** @property array @description array of line descriptor {raw: string, context: string, container: string} */
    lines = null

    /** @property string @description name of the module */
    module = null

    

    /** @return WebDoc @description instanciate a WebDoc instance from a javascript string @param string javascript javascript code @param string module name of the module containing the javascript */
    constructor(javascript, module = null) {
        super()
        this.module = module
        this.lines = javascript.split("\n").map(line => clean(line))
        
    }

    /** @return object @description complement and return a descriptor with document items @param object desc the descriptor to document */
    descriptor(desc) {
        for(const chunck of desc.chuncks) {
            const fields = chunck.split(" ").map(value => clean(value)).filter(value => value.length > 0)
            if(fields.length === 0) continue
            const chunck_type = fields[0].toLowerCase()
            switch(chunck_type) {
                case "module": case "class": case "function": case "const": case "property": case "return" :
                    break
                case "author": case "description": case "override": case "license": case "since": case "disclaimer": case "copyright":
                    desc[chunck_type] = clean(fields.slice(1).join(" "))
                    break
                case "param":
                    desc.params = desc.params || {}
                    desc.params[clean(fields[2])] = {
                        description: clean(fields.slice(3).join(" ")),
                        type: clean(fields[1])
                    }
                    break                               
                default:
                    this.error("cannot parse descriptor. Looks like a descriptor type (" + chunck_type + ") issue. Contact your administrator.", desc.position)
            }
            
        }
        return desc
    }

    /** @return none @description add a parse error to the log @param string message error message to display @param string line line of the error @param number position position in the input file/stream */
    error = (message, position) => {
        this.errors.push({
            message,
            line: this.lines[position],
            position: position + 1
        })
    }

    /** @return none @description output all the parsing error to console or file @ */
    log = (log_file = null) => {
        if(!log_file) for(const error of this.errors) console.warn("Error line " + error.position + ": " + error.message + " ("+error.line+")")
        console.warn("NOT IMPLEMENTED: write log in file " + log_file)        
    }

    /** @return WebDoc @description parse the description line and return the created descriptors */
    parse() {
        for(let i = 0; i < this.lines.length; i++) {
            let line = this.lines[i]
            const desc = {next_line: i < (this.lines.length - 1) ? clean(this.lines[i+1]) : null, position: i + 1}
            let terms = desc.next_line?.split(" ").map(v => clean(v))
            if(!line.startsWith("/*") || !line.endsWith("*/")) continue
            line = line.replaceAll("/**","").replaceAll("/*","").replaceAll("**/","").replaceAll("*/","")
            desc.chuncks = line.split(" @").map(chunck => clean(chunck))
            desc.chuncks.shift()
            desc.primitive = desc.chuncks[0].toLowerCase().startsWith("return") ? "function" : clean(desc.chuncks[0].split(" ")[0]).toLowerCase()
            switch(desc.primitive) {
                case "const":
                    desc.name = desc.next_line?.split(" ").map(i => clean(i))[1]
                    desc.type = clean(desc.chuncks[0].split(" ")[1])
                    break
                case "function":
                    desc.return_type = clean(desc.chuncks[0].split(" ")[1])
                    this.parseNextLine(desc, terms)
                    break
                case "class":
                    desc.name = desc.next_line?.split(" ").map(i => clean(i))[1]
                    if(desc.next_line?.split(" ").map(i => clean(i))[2] === "extends") desc.extends = desc.next_line?.split(" ").map(i => clean(i))[3]
                    if(desc.next_line?.endsWith("{")) this.#container_name = desc.name
                    break
                case "property":
                    desc.type = clean(desc.chuncks[0]?.split(" ")?.[1])
                    this.parseNextLine(desc, terms)
                    break
                case "module":
                    desc.name = clean(desc.chuncks[0].split(" ")[1])
                    if(this.module && desc.name !== module) this.error("inconsistancy of module name (" + this.module + "<>" + desc.name + ")",i)
                    break
                default:
                    this.error("cannot parse a descriptor with a starting tag " + desc.chuncks[0], i)
            }
            this.descriptor(desc)
            delete desc.chuncks
            delete desc.next_line
            this.descriptors.push(desc)
        }
        return this
    }

    /** @return none @description parse a line following a descriptor and update the descriptor @param object desc the descriptor to update @param array terms the elements of the splited line */
    parseNextLine(desc, terms) {
        desc.visibility = "public"
        desc.member_type = "instance"
        if(desc.primitive === "function") desc.function_type = "sync"
        if(terms[0] === "public") {
            terms.shift()
        }
        if(terms[0] === "private") {
            desc.visibility = "private"
            terms.shift()
        }
        if(terms[0] === "static") {
            desc.member_type = "static"
            terms.shift()
        }
        if(terms[0] === "async") {
            desc.function_type = "async"
            terms.shift()
        }
        if(terms[0].startsWith("#")) {
            desc.visibility = "private"
            terms[0] = terms[0].substring(1)
        }
        if(terms[0].indexOf(".") >= 0) {
            desc.name = clean(terms[0].split(".")[1])
            desc.container_name = clean(terms[0].split(".")[0])
            desc.container_type = "const"
            delete desc.member_type
        }
        if(terms[0].indexOf(".") < 0) {
            desc.name = clean(terms[0].split("(")[0])
            desc.container_type = "class"
            desc.container_name = this.#container_name
        }
    }

    /** @return object @description a json representation of some stats on the instance @param string mode expected output [json, string]*/
    stats(mode = "json") {
        if(mode !== "json") return super.stats(mode)
        return {...super.stats(mode),
            input: this.lines.length  + " lines",
            descriptors: this.descriptors.length  + " items",
            errors: this.errors.length
        }
    }

    /** @return WebDoc @description transform the descriptors into a document json */
    transform() {
        const constants = this.descriptors.filter(desc => desc.primitive === "const").reduce((result, e) => {
            result[e.name] = e
            delete result[e.name].name
            return result}, {})
        const classes = this.descriptors.filter(desc => desc.primitive === "class").reduce((result, e) => {
            result[e.name] = e
            delete result[e.name].name
            return result}, {})
        const module = this.descriptors.filter(desc => desc.primitive === "module")[0]
        const objects = {}
        for(const desc of this.descriptors) {
            if(desc.container_type === "const") {
                const constant = constants[desc.container_name]
                if(!constant[desc.primitive]) constant[desc.primitive] = {}                
                constant[desc.primitive][desc.name] = desc
                let c = constant[desc.primitive][desc.name]
                delete c.primitive 
                delete c.container_type 
                delete c.container_name 
                delete c.name
            } 
            if(desc.container_type === "class") {
                const cl = classes[desc.container_name]
                if(!cl[desc.primitive]) cl[desc.primitive] = {}                
                cl[desc.primitive][desc.name] = desc
                let c = cl[desc.primitive][desc.name]
                delete c.primitive 
                delete c.container_type 
                delete c.container_name 
                delete c.name
            }
        }
        for(const cst_name in constants) {
            let cst = constants[cst_name]
            if(cst.function || cst.property) {
                objects[cst_name] = cst
                delete constants[cst_name]
            }
        }
        this.document = {...module, constants, classes, objects}
        return this
    }
} 



export {WebDoc}