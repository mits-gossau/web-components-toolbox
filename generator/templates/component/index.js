#!/usr/bin/env node

const fs = require('fs-extra')
const ejs = require('ejs')
const argv = require('yargs-parser')(process.argv.slice(2))
const path = require('path')

const renderTemplates = (data, templatePath) => {
  const defaults = [
    { file: path.join(__dirname, './defaultHtml.ejs'), out: 'default-.html' },
    { file: path.join(__dirname, './defaultJs.ejs'), out: 'default-.js' },
    { file: path.join(__dirname, './defaultCss.ejs'), out: 'default-.css' }
  ]
  defaults.forEach((f) => {
    ejs.renderFile(f.file, data, {}, (err, str) => {
      if (err) console.error(err)
      const outputFile = `${templatePath}/${f.out}`
      fs.ensureFileSync(outputFile)
      fs.outputFileSync(outputFile, str)
    })
  })
}

const renderFile = (directoryPath, filename, data, options = {}) => {
  ejs.renderFile(filename, data, options, (err, str) => {
    if (err) console.error(err)
    const outputFile = path.join(process.cwd(), `${directoryPath}/${data.name}.js`)
    fs.ensureFileSync(outputFile)
    fs.outputFileSync(outputFile, str)
  })
}

const makeFolder = (directoryPath, templatePath) => {
  try {
    fs.mkdirSync(directoryPath)
    fs.mkdirSync(templatePath)
  } catch (err) {
    if (err.code === 'EEXIST') {
      // main dir
      fs.rmSync(directoryPath, { recursive: true, force: true })
      fs.mkdirSync(directoryPath)
      // template dir
      fs.rmSync(templatePath, { recursive: true, force: true })
      fs.mkdirSync(templatePath)
    } else {
      throw err
    }
  }
}

const main = () => {
  try {
    console.log('Generating template...')
    const { _: rest, name, type } = argv

    const data = {
      name: name.charAt(0).toUpperCase() + name.slice(1),
      folderName: name.charAt(0).toLowerCase() + name.slice(1),
      nameSpace: name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase(),
      type,
      typeShort: type.charAt(0)
    }

    if (!name || !type) {
      console.error('--name and --type flag required')
      process.exit(1)
    }

    const directoryPath = `./src/es/components/${data.type}/${data.folderName}/`
    const templatePath = `${directoryPath}/default-/`

    makeFolder(directoryPath, templatePath)
    const filename = path.join(__dirname, './component.ejs')
    renderFile(directoryPath, filename, data)
    renderTemplates(data, templatePath)
    console.log('Done. Reload File Explorer.')
  } catch (err) {
    console.error(err)
  }
}

main()
