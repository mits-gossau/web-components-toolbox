/* global fetch */
/* global location */


// the documenter shall only be used at component previews within src/...
const componentName = new URL(document.currentScript.src).searchParams.get('component')


if (componentName) {
  document.body.addEventListener('wc-config-load', event => event.detail.imports.forEach(importPromise => importPromise.then(importEl => {
    if (importEl[3].includes(componentName)) {

      // TODO
      /*Promise.all(urls.map(url =>
        fetch(url).then(resp => resp.text())
      )).then(texts => {
        …
      })*/

      // Fetch Examples
      fetch(document.URL).then(res => res.text()).then(file => {

        const reg = new RegExp(`\\<\/${importEl[0]}\\>`)
        const items = file.split(reg).map(item => item + `</${importEl[0]}>`)
        const modified = items.map(modEle => {
          const rep = modEle.replaceAll('<', '&lt;')
          rep.replaceAll('/>', '&lt;')
          return rep
        })

        const exampleComponents = []
        modified.slice(0, -1).forEach(item => {
          const wrapper = document.createElement("div")
          item.replace(/\s/g, '')
          wrapper.innerHTML = `<pre><code class="language-markup">${item}</code></pre>`
          //document.body.appendChild(wrapper)
          exampleComponents.push(wrapper)
        })
        const exampleDetails = document.createElement("details")
        const exampleSummary = document.createElement("summary")
        exampleComponents.forEach(component => exampleDetails.appendChild(component))
        exampleSummary.innerText = "Examples"
        exampleDetails.append(exampleSummary)
        document.body.appendChild(exampleDetails)

      })





      const cssURL = location.href.split("/")
      const lastElement = cssURL[cssURL.length - 1]
      const cssFileName = lastElement.split('.').slice(0, -1).join('.') + '.css'
      cssURL.pop()
      cssURL.push(cssFileName)
      const pathCss = cssURL.join("/")

      // Fetch CSS File
      fetch(pathCss).then(res => res.text()).then(file => {
        const detailsElement = this.createDetailsElement(file, 'css', 'CSS')
        document.body.appendChild(detailsElement)
      })

      // Fetch Code File
      fetch(location.href.replace(/\/(?:.(?!src\/))+$/g, importEl[3].replace('./', '/'))).then(res => res.text()).then(file => {

        const link = document.createElement('link')
        link.setAttribute('href', '../../../../../../docs/es/prism.css')
        link.setAttribute('rel', 'stylesheet')
        link.setAttribute('type', 'text/css')
        document.head.appendChild(link)

        const script_js = document.createElement('script')
        script_js.setAttribute('src', '../../../../../../docs/es/prism.js')
        document.body.append(script_js)

        const wcCode = this.createDetailsElement(file, "javascript", "Component Class")
        document.body.appendChild(wcCode)
      })
    }
  })))
}

function createDetailsElement(content, lang, summaryText) {
  const details = document.createElement("details")
  const pre = document.createElement("pre")
  pre.innerHTML = `<code class="language-${lang}">${content}</code>`
  details.appendChild(pre)
  const summary = document.createElement("summary")
  summary.innerText = summaryText
  details.append(summary)
  return details
}
