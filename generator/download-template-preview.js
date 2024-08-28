// script command: "uriDefault=https://www.klubschule.ch/kreativitaet/ path=../../pages/generator/ node download-template-preview.js"

const request = require('request')
const inquirer = require('inquirer')
const fs = require('fs-extra')
const path = require('path')

const init = async () => {
  if (!process.env.path) return console.error('Define env.path! Example Command: "path=../../pages/generator/ node download-template-preview.js"')
  switch (await promptIsWhat()) {
    case 0:
      return fetchNewPage()
    case 1:
      return console.log('update')
    case 2:
      return console.log('delete')
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
          // write html
          // create dirs if not applicable
          fs.mkdir(process.env.path, { recursive: true }, error => {if(error) console.error(error)})
          fs.writeFile(process.env.path + htmlFileName, cleanedBody, 'utf8', error => {if(error) console.error(error)})
          // write test
          fs.writeFile(process.env.path + htmlFileName + '.spec.js', writeVisualRegressionTest(htmlFileName, './' + htmlFileName), 'utf8', error => {if(error) console.error(error)})
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
      message: 'What do you want to do?',
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
          return 'Please provide a ur'
        }
        return true
      }
    }
  ]).then(({uri}) => uri)
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
  