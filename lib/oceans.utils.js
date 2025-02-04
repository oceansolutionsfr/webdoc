
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


/** @const object @description the object to access utils functions **/
const Utils = {}



/** @return object Utils @description assert a value @param boolean value expression to test (default false) @param string message text thrown @param number the HTTP status code of the error @param object body additional information to output if the test failed */
Utils.assert = (value = false, error_message = "unknown error", status = 500, body = null) => {
    if (!value) throw "assertion failed: HTTP " + status + " - " + HttpStatus[status] + ": " + error_message + (body ? " - " + JSON.stringify(body) : "")
    return Utils
}

/** @return string @description convert a base-10 number a string @param string|number value number to convert @param array base the base to use to convert the value (by default BASE_16) */
Utils.base = (value = "", base = BASE_16) => {
    let result = "", base_length = base.length
    if(typeof value !== "number" && parseInt(value) !== NaN) value = parseInt(value)            
    if (typeof value === "number") {
        while (value > 0) {
            result = base[value % base_length] + result
            value = Math.floor(value / base_length)
        }
    } else if (typeof value === "string") result = value.split("").reduce((result, char) => result + base.indexOf(char))
    else Utils.assert(false, "Cannot convert non-string or non-integer value: coding issue, check value type before calling Utils.base()")
    return result
}

/** @return object @description call an async function outsid of a module @param function func the async function @param any ...params the parameter to use with func */
Utils.callAsync = (func, ...params) => {
    let result = {status: null}
    func(...params).then(asyncResult => result = {status: "ok", data: asyncResult})
                    .catch(asyncError => result = {status: "error", error: asyncError, data: null})
    while (result.status === null) setTimeout(() => undefined, 10)
    return result
}

/** @return string @description center a text in a size length string @param string text the text to center @param number size size of the output text */
Utils.center = (text = "", size = 0) => text.padStart(text.length + Math.floor((size - text.length) / 2), ' ').padEnd(size, ' ')


/** @return string @description clean a string (trim, remove doubled quotes and doubles spaces) @param string str the string to clean */
Utils.clean = (str = "") => typeof str !== "string" ? null : str.replace(/\n/g, "").replace(/\\n/g, "").split('\\"').join('"').replace(/ +/g, " ").trim()


/** @return object @description create a deep clone of an object @param object obj the object to clone */
Utils.clone = obj => typeof obj !== "object" ? obj : typeof structuredClone !== "undefined" ? structuredClone(obj) : Object.assign({}, obj)


/** @return number @description calculate a distance between two dates @param Date date1 first date @param Date date2 second date */
Utils.compareDate = (date1, date2) => {
    if(date1 === date2) return 0
    if(!date1 || !date2) return 1
    date1 = new Date(date1)
    date2 = new Date(date2)
    if(date1.getFullYear() === date2.getFullYear() && date1.getMonth() === date2.getMonth() && date1.getDate() === date2.getDate()) return 0
    if(date1.getFullYear() === date2.getFullYear() && date1.getMonth() === date2.getMonth()) return Math.abs(date1.getDate() - date2.getDate())/365
    if(date1.getFullYear() === date2.getFullYear()) return Math.abs(date1.getMonth() - date2.getMonth())/12
    return 1
}

/** @return number @description convert a value to base 10 number @param string value to convert @param number base (default 36) */
Utils.convertFrom = (value, base = 36) => parseInt(value, base)


/** @return string @description convert a number to a base string @param number value value to convert @param number base base of the conversion (default 36) */
Utils.convertTo = (value, base = 36) => value.toString(base)


/** @return string @description create a string representation of a date @param string separator month and day separator (default -) @param string format format of the output (FR, US, EN) @param Date date date to convert @param boolean time add or not the time (by default false) */
Utils.date = (separator = "-", format = "FR", date, time = false) => {
    if (typeof date === "undefined" || date === "null" || date === null) date = null
    else {
        date = "" + date
        if (date.length === 6) date = date.substring(0, 4) + separator + date.substring(4, 6)
        if (date.length === 8) date = date.substring(0, 4) + separator + date.substring(4, 6) + separator + date.substring(6)
    }
    date = date === null ? new Date() : new Date(date)
    const suffix = time ? " " + String(date.getUTCHours()).padStart(2, "0") + ":" + String(date.getMinutes()).padStart(2, "0") + ":" + String(date.getSeconds()).padStart(2, "0") + "." + String(date.getMilliseconds()).padStart(3, "0") : ""
    return format === "US" ? [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join(separator) + suffix : format === "EN" ? [String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0"), date.getFullYear()].join(separator) + suffix : format === "FR" ? [String(date.getDate()).padStart(2, "0"), String(date.getMonth() + 1).padStart(2, "0"), date.getFullYear()].join(separator) + suffix : date
}

/** @return string @description apply an ellipsis to a string @param string input string to ellips @param number length length of the output string (by default 32) */
Utils.ellipsis = (input, length = 32) => input.length > (length - 3) ? `${input.substring(0, length-3)}...` : input


/** @return object @description parse an excel file content to a json object @param blob file_blob file content to parse **/
Utils.excelToJson = async (file_blob) => {
    const result = {status: "success", data: {}}
    const workbook = globalThis.XLSX.read(await file_blob.arrayBuffer(), {type: 'binary'})
    workbook.SheetNames.forEach(sheetName => result.data[sheetName] = globalThis.XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]))
    return result
}

/** @return any @description get a property value from a path @param object item object to look the property from @param string path path of the property @param string separator separator of the path (default .) */
Utils.get = (item = null, path = null, separator = ".") => {
    if (path === null || path.length === 0) return item
    path = "string" === typeof path ? path.split(separator) : path
    return "object" !== typeof item ? null : path.length === 1 ? item[path[0]] : Utils.get(item[path.shift()], path, separator)
}

/** @return string @description introspect the current function name @param number level the level of the function in the trace (by default 0) */
Utils.getCurrentFunctionName = (level = 0) =>  new Error("dummy").stack.split("\n")[level + 2].replace(/^\s+at\s+(.+?)\s.+/g, "$1")


/** @return string @description introspect the name of the script from which the function is called */
Utils.getScriptName = () => {
    let source
    const error = new Error(),
        lastStackFrameRegex = new RegExp(/.+\/(.*?):\d+(:\d+)*$/),
        currentStackFrameRegex = new RegExp(/getScriptName \(.+\/(.*):\d+:\d+\)/)
    if (((source = lastStackFrameRegex.exec(error.stack.trim())) && source[1] != "") || (source = currentStackFrameRegex.exec(error.stack.trim()))) return source[1]
    else if (error.fileName != undefined) return error.fileName
}

/** @return string @description hash a string with SHA-512 algorythm @param string text text to hash */
Utils.hash = async text => Array.from(new Uint8Array(await window.crypto.subtle.digest("SHA-512", new TextEncoder().encode(text)))).map((b) => b.toString(16).padStart(2, "0")).join("")


/** @return string @description hash a string with a custom algorythm @param string str text to hash @param number seed the seed used to hash (by default 0) */
Utils.hash53 = (str, seed = 0) => {
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed
    for(let i = 0, ch; i < str.length; i++) {
        ch = str.charCodeAt(i)
        h1 = Math.imul(h1 ^ ch, 2654435761)
        h2 = Math.imul(h2 ^ ch, 1597334677)
    }
    h1  = Math.imul(h1 ^ (h1 >>> 16), 2246822507)
    h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909)
    h2  = Math.imul(h2 ^ (h2 >>> 16), 2246822507)
    h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909)

    return Utils.base(""+ (624294967296 * (2097151 & h2) + (h1 >>> 0)), BASE_62)
}

/** @return string @description align left a text in a size length string @param string text the text to align @param number size size of the output text @param number pad left padding for the text (default 1) */
Utils.left = (str, size, pad = 1) => {
    return (str + "".padStart(pad, " ")).padEnd(size, " ")
}

/** @return number @description calculate the normalized levenshtein distances between two strings @param string s1 first string to compare @param string s2 second string to compare */
Utils.levenshtein = (s1, s2) => {
    if(!s1 && !s2) return 0
    if((s1 && !s2) || (!s1 && s2)) return 1
    const track = Array(s2.length + 1).fill(null).map(() => Array(s1.length + 1).fill(null))
    for (let i = 0; i <= s1.length; i += 1) track[0][i] = i
    for (let j = 0; j <= s2.length; j += 1) track[j][0] = j
    for (let j = 1; j <= s2.length; j += 1) {
        for (let i = 1; i <= s1.length; i += 1) {
            const indicator = s1[i - 1] === s2[j - 1] ? 0 : 1
            track[j][i] = Math.min(track[j][i - 1] + 1, track[j - 1][i] + 1, track[j - 1][i - 1] + indicator)
        }
    }
    return Math.abs(track[s2.length][s1.length] / Math.max(s1.length, s2.length))
}

/** @return string @description lowercase and clean a string @param string str string to lowerise */
Utils.lowerise = (str) => Utils.clean(str).toLowerCase().replaceAll(" ", "")


/** @return function @description create a resolve function that returns the result, after and updating statistics @param string function_name the name of the function to monitor @param string step mode of the call (by default "start" */
Utils.monitor = (function_name, step = "start") => {
    if (!Utils.monitor.functions) Utils.monitor.functions = {}
    if (!Utils.monitor.functions[function_name]) Utils.monitor.functions[function_name] = {}
    if (step === "start") {
        Utils.monitor.functions[function_name].calls = (Utils.monitor.functions[function_name].calls || 0) + 1
        Utils.monitor.functions[function_name].time = (Utils.monitor.functions[function_name].time || 0) - Math.floor(performance.now() * 1000)//Date.now()
    } else if (step === "stop") {
        Utils.monitor.functions[function_name].time = Utils.monitor.functions[function_name].time + Math.floor(performance.now() * 1000)
        Utils.monitor.functions[function_name].time_per_call = parseFloat((Utils.monitor.functions[function_name].time / (Utils.monitor.functions[function_name].calls ||1 )).toFixed(2))
    }
    return (result) => {
        Utils.monitor(function_name, "stop")
        return result
    }
}

/** @return string @description create a unique key for the collection @param object collection the indexed collection @param number base the base of the id to generate (default 36) @param number length the id (default 12) */
Utils.nextId = (collection, base = 36, length = 12) => {
    if(!collection) throw "oceans exception: cannot get next id from an empty collection"
    if(typeof collection !== "object") throw "oceans exception: cannot get nexwt id from an empty collection"
    const last_index = Object.keys(collection).sort().pop()
    return Utils.convertTo((Utils.convertFrom(last_index, base) + 1), base).padStart(0, length)
}
 
/** @return string @description calculate the formated percentage @param number value value to calculate the percent @param number total base of the percent */
Utils.percent = (value, total) => (typeof value !== "number" || typeof total !== "number" || total === 0) ? NaN : value / total < 0.0001 ? "00.00" : value >= total ? (((value * 10000) / total) / 100).toFixed(1) : "" + (((value * 10000) / total) / 100).toFixed(2).padStart(5, "0")


/** @return string @description calulate the proper version of a string (capitalize first letters of words) @param string str string to proper */
Utils.proper = (str = null) => {
    if(typeof str !== "string") console.error("cannot get proper version of a non string", str)
    if(!str || str.trim().length === 0) return str
    return str.toLowerCase().replaceAll("_", " ").split(" ")
        .map((w) => w ? w[0].toUpperCase() +  w.substring(1) : "")
        .join(" ")
        .trim()
}

/** @return string @description generate a random string @param number length of the output from chars @param array randomebase || RANDOM_BASE **/
Utils.random = (length = 4, randombase = BASE_16) => length === 0 ? "" : randombase[Math.floor(Math.random() * randombase.length)] + Utils.random(length - 1, randombase)


/** @return string @description align right a text in a size length string @param string text the text to align @param number size size of the output text @param number pad right padding for the text (default 1) */
Utils.right = (str, size, pad = 1) => (str + "".padEnd(pad, " ")).padStart(size, " ")


/** @return string @description return the current runtime [web, deno, bun, node] */
Utils.runtime = () => typeof (window) !== "undefined" ? "web" : typeof Deno !== "undefined" ? "deno" : typeof Bun !== "undefined" ? "bun" : "node"


/** @return number @description calculate the size of an array or an object @param object|array obj input value **/
Utils.size = obj => Array.isArray(obj) ? obj.length : typeof obj === "object" ? Object.keys(obj).length : NaN


/** @return string @description remove non ascii chars of a string @param string str the string to convert @param string space_replace char to replace the non ascii chars with (default null) */
Utils.toAscii = (str, space_replace = null) => Utils.clean(str.replaceAll("\n"," ").replaceAll("\\n"," ").normalize("NFD").replace(/[^a-zA-Z0-9 ]/g,"")).replaceAll(" ", space_replace || " ")


/** @return string @description return the time as a string @param string separator minute and second separator @param number duration the number of seconds to convert (default -1 means current time) @param boolean hours toggle the display of 00 for null hours (default true) **/
Utils.time = (separator = ":", duration = -1, hours = true) => {
    const time_array = duration === 0 ? ["00", "00", "00"] : duration < 0 ? [String(new Date().getHours() - 1).padStart(2, "0"), String(new Date().getMinutes()).padStart(2, "0"), String(new Date().getSeconds()).padStart(2, "0")] : [String(new Date(duration * 1000).getHours() - 1).padStart(2, "0"), String(new Date(duration * 1000).getMinutes()).padStart(2, "0"), String(new Date(duration * 1000).getSeconds()).padStart(2, "0")]
    if (!hours) time_array.shift()
    return time_array.join(separator)
}

/** @return string @description creates a unique alpha-numeric identifier based on random and date @param boolean case_sensitive if true the generated id is case sensitive */
Utils.uuid = (case_sensitive = false) => case_sensitive ? Utils.base(("" +Math.random()).substring(2,9) + Date.now(), BASE_62) : Utils.base(("" +Math.random()).substring(2,9) + Date.now(), BASE_36)


/** @return void @description pause the current thread for a duration @param number time duration of the pause in ms */
Utils.wait = (time) => new Promise(resolve => {setTimeout(resolve, time)})


/** @return boolean @description apply XOR logical function on boolean values @param boolean b1 first input @param boolean b2 seoond input */
Utils.xor = (b1, b2) => (b1 && !b2) || (!b1 && b2)


export {Utils, BASE_10, BASE_12, BASE_16, BASE_26, BASE_36, BASE_52, BASE_62, BASE_76}