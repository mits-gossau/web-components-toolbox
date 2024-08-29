// script command: "uriDefault=https://www.klubschule.ch/kreativitaet/ path=../../pages/generator/ node download-template-preview.js"

const inquirer = require('inquirer')
const request = require('request')
const fs = require('fs-extra')
const path = require('path')

const indexJsonFileName = 'index.json'

const init = async () => {
  if (!process.env.path) return console.error('Define env.path! Example Command: "path=../../pages/generator/ node download-template-preview.js"')
  switch (await promptIsWhat()) {
    case 0:
      return fetchNewPage()
    case 1:
      return promptUpdate()
    case 2:
      return promptDelete()
  }
}

const fetchNewPage = async (uri = null) => {
  if (!uri) uri = await promptWhichUri()
  try {
    console.log('Generating page based on...', uri)
    request(
      { uri },
      (error, response, body) => {
        if (!error) {
          let indexArray = []
          const htmlFileName = uri.replace(/[^a-zA-Z0-9-_]/g, '-').replace(/-$/g, '') + '.html'
          const cleanedBody = body
            .replace(/(.|\n|\r)*<o-body.*?>/gm, '')
            .replace(/<\/o-body>(.|\n|\r)*/gm, '<script type="text/javascript" src="./loader.js"></script>')
            .replace(/=(["']){1}\//gm, `=$1${(new URL(uri)).origin}/`)
            .trim()
          // write html
          // create dirs if not applicable
          fs.mkdir(process.env.path, { recursive: true }, error => {if(error) console.error(error)})
          fs.writeFile(process.env.path + htmlFileName, cleanedBody, 'utf8', error => {if(error) console.error(error)})
          // write test
          fs.writeFile(process.env.path + htmlFileName + '.spec.js', writeVisualRegressionTest(
            htmlFileName,
            `${process.env.testUri}${htmlFileName}`
          ), 'utf8', error => {if(error) console.error(error)})
          // read existing index json
          indexArray = readIndexJsonFile(process.env.path + indexJsonFileName, indexArray)
          // write json
          let indexObj
          if ((indexObj = indexArray.find(indexObj => indexObj.uri === uri))) {
            indexObj.timestamp = Date.now()
          } else {
            indexArray = [...indexArray, {htmlFileName, uri, timestamp: Date.now()}]
          }
          fs.writeFile(process.env.path + indexJsonFileName, JSON.stringify(indexArray), 'utf8', error => {if(error) console.error(error)})
          console.log('Done!')
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
const promptIsWhat = () => {
  const choices = ['Fetch a new page/uri?', 'Update a page/uri?', 'Delete a page/uri?']
  return inquirer.prompt([
    {
      name: 'answer',
      message: 'Hey, what do you want to do?',
      type: 'list',
      choices
    }
  ]).then(({answer}) => choices.indexOf(answer))
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
          return 'Please provide a uri'
        }
        return true
      }
    }
  ]).then(({uri}) => uri)
}

const promptDelete = () => {
  let indexArray
  const choices = (indexArray = readIndexJsonFile(process.env.path + indexJsonFileName)).map(indexObj => indexObj.uri)
  return inquirer.prompt([
    {
      name: 'deleteList',
      message: 'Which page/uri do you want to delete locally?',
      type: 'checkbox',
      choices,
      validate: (choices) => {
        if (choices.length > 1) {
          return 'Only delete one page after an other.' // JSON gets corrupted when async loop does read, write
        }
        return true
      }
    }
  ]).then(({deleteList}) => deleteList.forEach(deleteKey => {
    let indexObj
    if ((indexObj = indexArray.find(indexObj => indexObj.uri === deleteKey))) {
      console.log('deleting: ', process.env.path + indexObj.htmlFileName)
      fs.rmSync(process.env.path + indexObj.htmlFileName, { recursive: true, force: true })
      fs.rmSync(process.env.path + indexObj.htmlFileName + '.spec.js', { recursive: true, force: true })
      indexArray.splice(indexArray.indexOf(indexObj), 1)
      fs.writeFile(process.env.path + indexJsonFileName, JSON.stringify(indexArray), 'utf8', error => {if(error) console.error(error)})
    }
  }))
}

const promptUpdate = () => {
  let indexArray
  const choices = (indexArray = readIndexJsonFile(process.env.path + indexJsonFileName)).map(indexObj => `${indexObj.uri} | Last Updated: ${(new Date(indexObj.timestamp)).toLocaleString('en-US')}`)
  return inquirer.prompt([
    {
      name: 'updateList',
      message: 'Which page/uri do you want to update?',
      type: 'checkbox',
      choices,
      validate: (choices) => {
        if (choices.length > 1) {
          return 'Only update one page after an other.' // JSON gets corrupted when async loop does read, write
        }
        return true
      }
    }
  ]).then(({updateList}) => updateList.forEach(updateKey => {
    let indexObj
    if ((indexObj = indexArray.find(indexObj => indexObj.uri === updateKey.replace(/\s\|.*/g, '')))) fetchNewPage(indexObj.uri)
  }))
}

const readIndexJsonFile = (path, array = []) => {
  if (fs.existsSync(path)) array = JSON.parse(fs.readFileSync(path, 'utf8') || '[]')
  return array
}

const writeVisualRegressionTest = (name, htmlPath) => {
  return `
    const { test, expect } = require('@playwright/test')

    const dir = process.cwd().split('/').pop().split('-')
    const PROJECT_NAME = dir.splice(3)[0]
    const WAITING_TIMEOUT = 200

    test('${name}', async ({ page, browserName }) => {
      await page.goto('${htmlPath}')
      const demoPage = await page.waitForSelector('body')
      const wcLoaded = await demoPage.getAttribute('wc-config-load')
      console.log('wait for wc-load')
      if (wcLoaded) {
        console.log('loaded')
        await page.evaluate(() => document.fonts.ready)
        await page.waitForTimeout(WAITING_TIMEOUT)
        await page.evaluate(() => window.scrollTo(0, 999999999))
        await page.waitForTimeout(WAITING_TIMEOUT)
        await page.evaluate(() => window.scrollTo(0, 999999999))
        await page.waitForTimeout(WAITING_TIMEOUT)
        await page.evaluate(() => window.scrollTo(0, 999999999))
        await page.waitForTimeout(WAITING_TIMEOUT)
        await page.evaluate(() => window.scrollTo(0, 0))
        await page.waitForTimeout(WAITING_TIMEOUT)
        expect(await page.screenshot({ fullPage: true })).toMatchSnapshot(\`\${PROJECT_NAME}.png\`)
      }
    })
  `
}
  
init()
  