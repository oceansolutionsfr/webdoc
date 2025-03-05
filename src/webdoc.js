/** @module webdoc.js @copyright © 2025 @author sebastien.mamy@gmail.com @license GNU General Public Licence v2 @disclaimer in no event shall the author be liable for any claim or damages. */

import {OObject} from "../lib/oceans.utils.js"

const clean = (str = "") => typeof str !== "string" ? null : str.replace(/\n/g, "").replace(/\\n/g, "").split('\\"').join('"').replace(/ +/g, " ").trim()

const OCEANS_PNG = "iVBORw0KGgoAAAANSUhEUgAAA+gAAAPoCAYAAABNo9TkAAAACXBIWXMAAC4jAAAuIwF4pT92AAAF0WlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSLvu78iIGlkPSJXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQiPz4gPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iQWRvYmUgWE1QIENvcmUgOS4xLWMwMDIgNzkuYTFjZDEyZjQxLCAyMDI0LzExLzA4LTE2OjA5OjIwICAgICAgICAiPiA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtbG5zOmRjPSJodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyIgeG1sbnM6cGhvdG9zaG9wPSJodHRwOi8vbnMuYWRvYmUuY29tL3Bob3Rvc2hvcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RFdnQ9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZUV2ZW50IyIgeG1wOkNyZWF0b3JUb29sPSJBZG9iZSBQaG90b3Nob3AgMjYuMyAoTWFjaW50b3NoKSIgeG1wOkNyZWF0ZURhdGU9IjIwMjUtMDMtMDVUMDk6MDA6MTQrMDE6MDAiIHhtcDpNb2RpZnlEYXRlPSIyMDI1LTAzLTA1VDA5OjAxOjQ5KzAxOjAwIiB4bXA6TWV0YWRhdGFEYXRlPSIyMDI1LTAzLTA1VDA5OjAxOjQ5KzAxOjAwIiBkYzpmb3JtYXQ9ImltYWdlL3BuZyIgcGhvdG9zaG9wOkNvbG9yTW9kZT0iMyIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDoxMjI0NDA3NS0wMjA4LTRlOTgtOTVjNC0wODM4ZWVlYTMzZjEiIHhtcE1NOkRvY3VtZW50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"


/** @class WebDoc @description manage documentation */
class WebDoc extends OObject {

    /** @property string @description base64 encoding of the black oceans PNG logo in 1000x1000 pixels */
    static oceansLogo = OCEANS_PNG

    /** @property string @description name of the current container of a descriptor */
    #container_name = null
    
    /** @property object @description the object containing the result of the transforming of modules indexed by module name */
    document = {}
    
    /** @property array @description the array containing all the parsing errors */
    errors = []

    /** @property object @description all modules of the WebDoc instance */
    modules = {}

    /** @property object @desciption all elements indexed by path*/
    items = {}

    /** @property Element @description the DOM element for the page rendering */
    pageElement = null
    

    /** @return WebDoc @description instanciate a WebDoc instance */
    constructor() {
        super()
        this.page = document.createElement("div")
        this.page.id = "page"
        this.page.classList="page"
        document.body.appendChild(this.page)
    }


    /** @return WebDoc @description adds a module to the current instance. The modules are stored in the order they are added @param object module the module descriptor to add {name, lines, javascript} */
    add(module) {
        if(this.modules[module.name]) return console.warn("cannot add " + module.name + ": the module has already been added to the WebDoc instance")
        this.modules[module.name] = {name: module.name, lines: module.javascript.split("\n").map(line => clean(line)), descriptors: []}
    }


    /** @return object @description complement and return a descriptor with document items @param object desc the descriptor to document */
    #descriptor(desc, module) {
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
                    this.#error("cannot parse descriptor. Looks like a descriptor type (" + chunck_type + ") issue. Contact your administrator.", module, desc.position)
            }
            
        }
        return desc
    }

    /** @return none @description add a parse error to the log @param string message error message to display @param string line line of the error @param number position position in the input file/stream */
    #error(message, module, position) {
        this.errors.push({
            message,
            line: this.modules?.[module]?.lines?.[position],
            module,
            position: position + 1,
            webdoc: this
        })
    }

    /** @return none @description output all the parsing error to console or file @ */
    log(log_file = null) {
        if(!log_file) for(const error of this.errors) console.warn("Error line " + error.position + ": " + error.message + " ("+error.line+")")
        console.warn("NOT IMPLEMENTED: write log in file " + log_file)        
    }

    /** @return WebDoc @description update the dom displaying documentation about the path @param string path the path (with __ separator) */
    navigate(path) {
        document.getElementById("path").innerHTML = path.replaceAll("__"," <span class='separator'> &#x009B; </span>")
        const item = this.item[path]
        this.pageElement.innerHTML = this.item[path]
        return this
    }


    /** @return WebDoc @description parse the description line and return the created descriptors */
    parse() {
        for(const module of Object.values(this.modules)) {
            for(let i = 0; i < module.lines.length; i++) {
                let line = module.lines[i]
                let desc = {next_line: i < (module.lines.length - 1) ? clean(module.lines[i+1]) : null, position: i + 1}
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
                        desc.path = module.name + "__" + desc.name
                        break
                    case "function":
                    case "property":
                        desc.type = clean(desc.chuncks[0].split(" ")[1])
                        desc = this.#parseNextLine(desc, terms)
                        desc.path = module.name + "__" + desc.container_name + "__" + desc.name
                        break
                    case "class":
                        desc.name = desc.next_line?.split(" ").map(i => clean(i))[1]
                        if(desc.next_line?.split(" ").map(i => clean(i))[2] === "extends") desc.extends = desc.next_line?.split(" ").map(i => clean(i))[3]
                        if(desc.next_line?.endsWith("{")) this.#container_name = desc.name
                        desc.path = module.name + "__" + desc.name
                        break
                    case "module":
                        desc.name = clean(desc.chuncks[0].split(" ")[1])
                        desc.path = module.name
                        if(this.module && desc.name !== module) this.#error("inconsistancy of module name (" + this.module + "<>" + desc.name + ")",module, i)
                        break
                    default:
                        this.#error("cannot parse a descriptor with a starting tag " + desc.chuncks[0], module, i)
                }
                desc = this.#descriptor(desc, module)
                delete desc.chuncks
                delete desc.next_line
                module.descriptors.push(desc)
            }
        }
        return this
    }

    /** @return object @description parse a line following a descriptor and return the updated descriptor @param object desc the descriptor to update @param array terms the elements of the splited line */
    #parseNextLine(desc, terms) {
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
        return desc
    }


    /** @return WebDoc @description render the module in the page DOM element @param string path the path to the module to display */
    #renderModule(path) {

        return this
    }

    /** @return object @description a json representation of some stats on the instance @param string mode expected output [json, string]*/
    stats(mode = "json") {
        if(mode !== "json") return super.stats(mode)
        const stats = {...super.stats(mode), input: 0, modules: Object.keys(this.modules).length, descriptor: 0, errors: this.errors.length, classes: 0, constants: 0}
        for(const module of Object.values(this.modules)) {
            stats.input += module.lines.length
            stats.descriptor += module.descriptors.length
            stats.classes += module.descriptors.filter(descriptor => descriptor.primitive === "class").length
            stats.constants += module.descriptors.filter(descriptor => descriptor.primitive === "const").length
        }
        return stats
    }

    /** @return WebDoc @description transform the descriptors into a document json */
    transform() {
        for(const module of Object.values(this.modules)) {
            this.items = module.descriptors.reduce((result, descriptor) => {
                return {...result, [descriptor.path] : descriptor}
            },this.items)
            const constants = module.descriptors.filter(desc => desc.primitive === "const").reduce((result, e) => ({...result, [e.name]: e}),{})
            const classes = module.descriptors.filter(desc => desc.primitive === "class").reduce((result, e) => ({...result, [e.name]: e}),{})
            const mod = module.descriptors.filter(desc => desc.primitive === "module")[0]
            const objects = {}
            for(const desc of module.descriptors) {
                if(desc.container_type === "const") {
                    const constant = constants[desc.container_name]
                    if(!constant[desc.primitive]) constant[desc.primitive] = {}                
                    constant[desc.primitive][desc.name] = desc
                    let c = constant[desc.primitive][desc.name]
                    delete c.container_type 
                    delete c.container_name
                } 
                if(desc.container_type === "class") {
                    const cl = classes[desc.container_name]
                    if(!cl[desc.primitive]) cl[desc.primitive] = {}                
                    cl[desc.primitive][desc.name] = desc
                    let c = cl[desc.primitive][desc.name]
                    delete c.container_type 
                    delete c.container_name
                }
            }
            for(const cst_name in constants) {
                let cst = constants[cst_name]
                if(cst.function || cst.property) {
                    objects[cst_name] = cst
                    delete constants[cst_name]
                }
            }
            this.document[module.name] = {...mod, constants, classes, objects}
        }
        return this
    }
} 



export {WebDoc}