#!/usr/bin/env node

const fs = require('fs-extra')
const ejs = require('ejs')
const argv = require('yargs-parser')(process.argv.slice(2))
const path = require('path')

const defaultTemplates = (data, templatePath) => {
  const html = path.join(__dirname, './defaultHtml.ejs') 
  const js = path.join(__dirname, './defaultJs.ejs') 
  const css = path.join(__dirname, './defaultCss.ejs') 

  ejs.renderFile(html, data, {}, (err, str) => {
    if (err) console.error(err)
    const outputFile = `${templatePath}/default-.html`
    fs.ensureFileSync(outputFile)
    fs.outputFileSync(outputFile, str)
  })

  //
  ejs.renderFile(js, data, {}, (err, str) => {
    if (err) console.error(err)
    const outputFile = `${templatePath}/default-.js`
    fs.ensureFileSync(outputFile)
    fs.outputFileSync(outputFile, str)
  })
  //
  ejs.renderFile(css, data, {}, (err, str) => {
    if (err) console.error(err)
    const outputFile = `${templatePath}/default-.css`
    fs.ensureFileSync(outputFile)
    fs.outputFileSync(outputFile, str)
  })
}

const main = () => {
  try {
    console.log('Generating template...')
    const { _: rest, name, type } = argv
    console.log(name,type)
    console.log(argv)
    const data = {
      name: name.charAt(0).toUpperCase() + name.slice(1),
      folderName: name.charAt(0).toLowerCase() + name.slice(1),
      nameSpace: name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase(),
      type,
      typeShort: type.charAt(0)
    }

    const options = {}

    if (!name || !type) {
      console.error('--name and --type flag required')
      process.exit(1)
    }

    const filename = path.join(__dirname, './component.ejs')

    ejs.renderFile(filename, data, options, (err, str) => {
      if (err) console.error(err)
      const directoryPath = `./src/es/components/${data.type}/${data.folderName}/`
      const templatePath = `${directoryPath}/default-/` 
      try {
        fs.mkdirSync(directoryPath)
        fs.mkdirSync(templatePath)
      } catch (err) {
        if (err.code === 'EEXIST') {
          // dir
          fs.rmSync(directoryPath, { recursive: true, force: true })
          fs.mkdirSync(directoryPath)

          //template dir
          fs.rmSync(templatePath, { recursive: true, force: true })
          fs.mkdirSync(templatePath)

        } else {
          throw err
        }
      }

      const outputFile = path.join(process.cwd(), `${directoryPath}/${data.name}.js`)
      fs.ensureFileSync(outputFile)
      fs.outputFileSync(outputFile, str)
      defaultTemplates(data, templatePath)
      console.log('Done. Reload File Explorer.')
    })
  } catch (err) {
    console.error(err)
  }
}

main()
