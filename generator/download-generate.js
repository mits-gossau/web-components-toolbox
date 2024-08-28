// script command: "uriDefault=https://www.klubschule.ch/kreativitaet/ path=../../pages/generator/ node download-generate.js"

const request = require('request')
const inquirer = require('inquirer')
const fs = require('fs-extra')
const path = require('path')

const init = async () => {
  if (!process.env.path) return console.error('Define env.path! Example Command: "path=../../pages/generator/ node download-generate.js"')
  if (await promptIsFetchNewPage()) {
    fetchNewPage()
  } else {
    console.log('******update***')
  }
}

const fetchNewPage = async () => {
  const uri = await promptWhichUri()
  try {
    console.log('Generating page based on...', uri)
    request(
      { uri },
      (error, response, body) => {
        if (!error) {
          const indexJsonFileName = 'index.json'
          let indexArray = []
          const htmlFileName = uri.replace(/[^a-zA-Z0-9-_]/g, '-').replace(/-$/g, '') + '.html'
          const cleanedBody = body.replace(/(.|\n|\r)*<o-body.*?>/gm, '').replace(/<\/o-body>(.|\n|\r)*/gm, '').trim()
          // create dirs if not applicable
          fs.mkdir(process.env.path, { recursive: true }, error => {if(error) console.error(error)})
          // write html
          fs.writeFile(process.env.path + htmlFileName, cleanedBody, 'utf8', error => {if(error) console.error(error)})
          // read existing index json
          if (fs.existsSync(process.env.path + indexJsonFileName)) indexArray = JSON.parse(fs.readFileSync(process.env.path + indexJsonFileName, 'utf8'))
          // write json
          let indexObj
          if ((indexObj = indexArray.find(index => index.uri === uri))) {
            indexObj.timestamp = Date.now()
          } else {
            indexArray = [...indexArray, {htmlFileName, uri, timestamp: Date.now()}]
          }
          fs.writeFile(process.env.path + indexJsonFileName, JSON.stringify(indexArray), 'utf8', error => {if(error) console.error(error)})
        } else {
          console.error(error)
        }
      }
    )
  } catch (err) {
    console.error(err)
  }
}

/* prompts */
const promptIsFetchNewPage = () => {
  return inquirer.prompt([
    {
      name: 'newPage',
      message: 'Do you want fetch a new page/uri?',
      type: 'list',
      choices: ['yes', 'no']
    }
  ]).then(({newPage}) => newPage === 'yes')
}

const promptWhichUri = () => {
  return inquirer.prompt([
    {
      name: 'uri',
      message: 'Which uri do you want to fetch?',
      type: 'input',
      default: process.env.uriDefault || '',
      validate: (name) => {
        if (!name.length) {
          return 'Please provide a ur'
        }
        return true
      }
    }
  ]).then(({uri}) => uri)
}
  
init()
  