const fs = require('fs')
const path = require('path')
const glob = require('glob')
const getAttributeNames = require('./documenter/getAttributes')
const getCSSproperties = require('./documenter/getCSSProperties')
const getTemplates = require('./documenter/getTemplates')
const jsonToMarkdown = require('./documenter/jsonToMarkdown')
const { json } = require('stream/consumers')
// const generateModified = require('./documenter/generateModified')

const ROOT_DIR = '../src/es/components/'

glob.sync(`${ROOT_DIR}/**/*(*.{js,ts,jsx,tsx})`, {
  ignore: [
    `${ROOT_DIR}/prototypes/**`,
    `${ROOT_DIR}/pages/**`,
    `${ROOT_DIR}/msrc/**`,
    `${ROOT_DIR}/mcs/**`,
    `${ROOT_DIR}/controllers/**`,
    `${ROOT_DIR}/contentful/**`
  ]
}).forEach(async file => {
  // For each file found, prepare a data object containing:
  // - the file path
  // - CSS properties extracted from the file
  // - attribute names extracted from the file
  const data = {
    path: file,
    templates: getTemplates(file),
    attributes: getAttributeNames(file), // Extract attribute names from the file
    css: getCSSproperties(file).css // Extract CSS properties from the file
  }

  // Convert the data object to a JSON string with indentation for readability
  const jsonData = JSON.stringify(data, null, 2)

  const basename = file.split('/').pop() // Get the last part of the path
  const filenameWithoutExtension = basename.split('.').slice(0, -1).join('.') // Remove the extension
  const md = jsonToMarkdown(data, filenameWithoutExtension)
  // console.log(md)
  // fs.writeFileSync(`${filenameWithoutExtension}.md`, md);

  // Perform both file write operations concurrently:
  // - Overwrite the original file with its modified version
  // - Write the JSON data to a new x.json file in the same directory as the original file
  await Promise.all([
    // fs.promises.writeFile(file, generateModified(file)), // Write the modified code back to the file
    // fs.promises.writeFile(`${path.dirname(file)}/${filenameWithoutExtension}.json`, jsonData) // Write the JSON data to a file
    // fs.promises.writeFile(`${path.dirname(file)}/${filenameWithoutExtension}.md`, md) // Write the markdown file 
  ])


  console.log('=============================================')
  console.log(`Name: ${filenameWithoutExtension}`)
  console.log(`Path: ${file}`)
  console.log('JSON data:')
  console.log(jsonData)
  console.log('---------------------------------------------')
  console.log(' ')
})
