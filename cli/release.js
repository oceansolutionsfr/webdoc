
import minify from '@node-minify/core'
import uglifyjs from '@node-minify/uglify-js'

import fs from "fs"

const DIST_FOLDER = "./dist"
const LATEST_FOLDER = DIST_FOLDER + "/latest/"
const VERSIONS_FOLDER = DIST_FOLDER + "/versions/"
const TEMP_FILE = "./tmp/temp"


const versions = []
const release_type = process.argv[2] || "minor"

fs.readdirSync(VERSIONS_FOLDER).forEach(file => versions.push(file))

versions.sort()
const current_version = versions.length > 0 ? versions[versions.length - 1] : "0.0"

const major = current_version.split(".")[0]
const minor = current_version.split(".")[1]
let next_version = ""
let build = (new Date()).toISOString().replace(/[^0-9]/g, "").slice(0, -3)

if(release_type === "major") next_version = (parseInt(major) + 1) + ".0"
if(release_type === "minor") next_version = major + "." + (parseInt(minor) + 1)

if(fs.existsSync(VERSIONS_FOLDER + next_version)) exit(1, "Version " + next_version + " already exists.")

fs.mkdirSync(VERSIONS_FOLDER + next_version)

if(fs.existsSync(TEMP_FILE)) fs.unlinkSync(TEMP_FILE)
const js = "/** @version " + next_version + " @build " + build + " copyright (C) " + (""+build).substring(0,4) + " sebastien.mamy@gmail.com\n * @license GNU General Public Licence v2 @disclaimer in no event shall the author be liable for any claim or damages. */\n" + 
            await minify({ compressor: uglifyjs, input: "./src/webman.js", output: TEMP_FILE })
fs.writeFileSync(VERSIONS_FOLDER + next_version + "/webman.min.js", js)
fs.unlinkSync(TEMP_FILE)

if(fs.existsSync(LATEST_FOLDER + "webman.min.js")) fs.unlinkSync(LATEST_FOLDER + "webman.min.js")
fs.copyFileSync(VERSIONS_FOLDER + next_version + "/webman.min.js", LATEST_FOLDER + "webman.min.js")