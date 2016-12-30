const fs = require('fs')
const path = require('path')
const commandLineArgs = require('command-line-args')
const fetch = require('isomorphic-fetch')
const dotenv = require('dotenv')

dotenv.config()

const API_URL = 'https://us-west-2.api.scaphold.io/graphql/synth2'

const optionDefinitions = [
  { name: 'directory', type: String, defaultOption: true, defaultValue: '.' }
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
const abstractions = pdFiles.map(name => {
  return {
    name: name.slice(0, name.length - 3),
    source: fs.readFileSync(path.join(directory, name), 'utf8')
  }
})

const query = `mutation CreatePureDataPatch($input: CreatePureDataPatchInput!) {
  createPureDataPatch(input: $input) {
    changedPureDataPatch {
      id
      source
      abstractions {
        name
        source
      }
      requiresAudioInput
    }
  }
}`
const variables = {
  input: {
    source,
    abstractions,
    requiresAudioInput: false
  }
}
fetch(API_URL, {
  method: 'POST',
  body: JSON.stringify({ query, variables }),
  headers: {
    'Authorization': 'Bearer ' + process.env.SCAPHOLD_ADMIN_TOKEN,
    'Content-Type': 'application/json'
  }
})
  .then(result => {
    result.json().then(json => {
      if (result.status !== 200) {
        console.error('Unsuccessful HTTP status returned', json)
        process.exit(1)
      }

      console.log('Created patch with id ' + json.data.createPureDataPatch.changedPureDataPatch.id)
    })
  })
  .catch(error => {
    console.error('Request failed', error)
    process.exit(1)
  })
