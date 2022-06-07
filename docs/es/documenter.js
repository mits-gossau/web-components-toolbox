/* global fetch */
/* global location */

// the documenter shall only be used at component previews within src/...
const componentName = new URL(document.currentScript.src).searchParams.get('component')

if (componentName) {
  document.body.addEventListener('wc-config-load', event => event.detail.imports.forEach(importPromise => importPromise.then(importEl => {
    if (importEl[3].includes(componentName)) {
      // examples path
      const currentPagePath = location.href

      // class path
      const componentClassPath = currentComponentClass(location, replaceComponentPath(importEl[3]))

      // css path
      const cssPath = getCSSPath(location)

      Promise.all([currentPagePath, cssPath, componentClassPath].map(url =>
        fetch(url).then(resp => resp.text())
      )).then(texts => {
        setupPrism()
        exampleComponents(importEl[0], texts[0])
        componentCSS(texts[1])
        componentClass(texts[2])
      })
    }
  })))
}

const replaceComponentPath = path => path.replace('./', '/')
const currentComponentClass = (location, component) => location.origin + component
const replaceFileType = (fileName, newType) => fileName.split('.').slice(0, -1).join('.') + `.${newType}`

const getFileNameFromPath = path => {
  const elements = path.split('/')
  return elements[elements.length - 1]
}

const replaceFile = (original, newFile) => {
  const pathElements = original.pathname.split('/')
  pathElements.pop()
  pathElements.push(newFile)
  return pathElements
}

function getCSSPath (browserLocation) {
  const fileName = getFileNameFromPath(browserLocation.pathname)
  const newFileName = replaceFileType(fileName, 'css')
  return browserLocation.origin + replaceFile(browserLocation, newFileName).join('/')
}

function exampleComponents (tagName, data) {
  const tagPattern = RegExp(`<${tagName}(.|\n)*?</${tagName}>`, 'g')
  const tags = data.match(tagPattern)
  const modified = tags.map(modEle => modEle.replaceAll('<', '&lt;'))

  const exampleComponents = []
  modified.forEach(item => {

    const btn = document.createElement('button')
    btn.innerText = 'copy'
    btn.classList.add('copy-btn')
    btn.addEventListener('click', function () {
      navigator.clipboard.writeText(item.replaceAll('&lt;', '<'))
    })

    const pre = document.createElement('pre')
    pre.classList.add('pre-wrapper')

    const code = document.createElement('code')
    code.classList.add('language-markup')
    code.innerHTML = item.trim()

    const wrapper = document.createElement('div')

    pre.appendChild(btn)
    pre.appendChild(code)
    wrapper.append(pre)

    exampleComponents.push(wrapper)
  })

  const exampleDetails = document.createElement('details')
  const exampleSummary = document.createElement('summary')
  exampleComponents.forEach(component => exampleDetails.appendChild(component))
  exampleSummary.innerText = 'Examples'
  exampleDetails.append(exampleSummary)
  document.body.appendChild(exampleDetails)
}

function componentCSS (data) {
  const detailsElement = createDetailsElement(data, 'css', 'CSS')
  document.body.appendChild(detailsElement)
}

function componentClass (data) {
  const wcCode = this.createDetailsElement(data, 'javascript', 'Component Class')
  document.body.appendChild(wcCode)
}

function createDetailsElement (content, lang, summaryText) {
  const details = document.createElement('details')
  const pre = document.createElement('pre')
  pre.innerHTML = `<code class="language-${lang}">${content}</code>`
  details.appendChild(pre)
  const summary = document.createElement('summary')
  summary.innerText = summaryText
  details.append(summary)
  return details
}

function setupPrism () {
  const link = document.createElement('link')
  link.setAttribute('href', '../../../../../../docs/es/prism.css')
  link.setAttribute('rel', 'stylesheet')
  link.setAttribute('type', 'text/css')
  document.head.appendChild(link)
  const prismJS = document.createElement('script')
  prismJS.setAttribute('src', '../../../../../../docs/es/prism.js')
  document.body.append(prismJS)
}
