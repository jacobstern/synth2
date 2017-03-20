const fs = require('fs')
const path = require('path')
const commandLineArgs = require('command-line-args')

const optionDefinitions = [
  { name: 'directory', type: String, defaultOption: true, defaultValue: '.' },
  { name: 'js', type: Boolean, defaultValue: false },
  { name: 'out', type: String }
]
const options = commandLineArgs(optionDefinitions)
const directory = options.directory

const files = fs.readdirSync(directory)
const pdFiles = files.filter(name => {
  if (!name.endsWith('.pd')) {
    return false
  }
  return fs.statSync(path.join(directory, name)).isFile()
})

const mainName = 'main.pd'
const mainIndex = pdFiles.indexOf(mainName)
if (mainIndex < 0) {
  console.error('Error: Could not find main.pd')
  process.exit(1)
}

const source = fs.readFileSync(path.join(directory, pdFiles[mainIndex]), 'utf8')
const abstractions = pdFiles.filter((value, index) => index !== mainIndex).map(name => {
  return {
    name: name.slice(0, name.length - 3),
    source: fs.readFileSync(path.join(directory, name), 'utf8')
  }
})
const json = JSON.stringify({
  source,
  abstractions
})
const outputFile = options.out || path.join(directory, options.js ? 'patch.js' : 'patch.json')
if (options.js) {
  fs.writeFileSync(outputFile, 'export default ' + json)
} else {
  fs.writeFileSync(outputFile, json)
}

