/* global customElements */

import FetchCss from '../../src/es/components/controllers/fetchCss/FetchCss.js'

if (!customElements.get('c-fetch-css')) customElements.define('c-fetch-css', FetchCss)

document.body.addEventListener('wc-config-load', event => {
  event.detail.imports[0].then(importEl => {
    globalThis.cacheBusterImportPath = importEl[3]
  })
})
