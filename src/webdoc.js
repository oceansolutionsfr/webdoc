/** copyright (C) 2025 sebastien.mamy@gmail.com
 *  @license GNU General Public Licence v2 @disclaimer in no event shall the author be liable for any claim or damages. */



const clean = (str = "") => typeof str !== "string" ? null : str.replace(/\n/g, "").replace(/\\n/g, "").split('\\"').join('"').replace(/ +/g, " ").trim()

// a root for all the classes
class OObject{#a=null;#b=null;constructor(){this.#a=Date.now(),this.#b=parseInt((""+Math.random()).substring(2,16)+this.__timestamp).toString(16)}stats(t="json"){if("json"===t)return{class:this.constructor.name,id:this.#b,timestamp:this.#a};let s=this.stats();return Object.keys(s).reduce((t,i)=>t+="  - "+i+": "+s[i]+"\n","Object Instance\n")}}


/** @class WebDoc @description manage documentation */
class WebDoc extends OObject {

    /** @property array @description array of line descriptor {raw: string, context: string, container: string} */
    lines = null

    /** @property array @description the array containing all the parsing errors */
    errors = []

    /** @property object @description the object containing the result of the parsing */
    document = []
    
    /** @property array @description contains the descriptor of javascript element {line: string, next_line: line, position: number} */
    descriptors = []

    /** @property string @description name of the current container of a descriptor */
    #container_name = null
    
    
    context() {
        return this.__context[this.__context.length - 1]
    }

    /** @return WebDoc @description instanciate a parse a javascript file and create a documentation object from WebDoc comments @param :string javascript javascript code @param :object options the parser options {format}  */
    constructor(javascript) {
        super()
        this.lines = javascript.split("\n").map(line => clean(line))
        
    }

    /** @return object @description complement and return a descriptor with document items @param object desc the descriptor to document */
    descriptor(desc) {
        for(const chunck of desc.chuncks) {
            const fields = chunck.split(" ").map(value => clean(value)).filter(value => value.length > 0)
            const chunck_type = fields[0].toLowerCase()
            switch(chunck_type) {
                case "module": case "class": case "function": case "const": case "property": case "return" :
                    break
                case "author": case "description": case "override": case "license": case "since": case "disclaimer":
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

    /** @return array @description parse the description line and return the created descriptors */
    parse() {
        for(let i = 0; i < this.lines.length; i++) {
            let line = this.lines[i]
            const desc = {status: "valid", next_line: i < (this.lines.length - 1) ? clean(this.lines[i+1]) : null, position: i + 1}
            let terms = desc.next_line?.split(" ").map(v => clean(v))
            if(!line.startsWith("/*") || !line.endsWith("*/")) continue
            line = line.replaceAll("/**","").replaceAll("/*","").replaceAll("**/","").replaceAll("*/","")
            desc.chuncks = line.split(" @").map(chunck => clean(chunck))
            desc.chuncks.shift()
            desc.primitive = desc.chuncks[0].toLowerCase().startsWith("return") ? "function" : clean(desc.chuncks[0].split(" ")[0]).toLowerCase()
            switch(desc.primitive) {
                case "const":
                    desc.name = desc.next_line?.split(" ").map(i => clean(i))[2]
                    desc.type = desc.next_line?.split(" ").map(i => clean(i))[1]
                    break
                case "function":
                    desc.return_type = clean(desc.chuncks[0].split(" ")[1])
                    this.parseNextLine(desc, terms)
                    break
                case "class":
                    desc.name = desc.next_line?.split(" ").map(i => clean(i))[1]
                    if(desc.next_line?.endsWith("{")) this.#container_name = desc.name
                    break
                case "property":
                    desc.type = clean(desc.chuncks[0]?.split(" ")?.[1])
                    this.parseNextLine(desc, terms)
                    break
                case "module":
                    desc.name = clean(desc.chuncks[0].split(" ")[1])
                    break
                default:
                    this.error("cannot parse a descriptor with a starting tag " + desc.chuncks[0], i)
            }
            this.descriptor(desc)
            delete desc.chuncks
            delete desc.next_line
            this.descriptors.push(desc)
        }
        return this.descriptors
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
            desc.member_type = "object"
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

} 



export {WebDoc}