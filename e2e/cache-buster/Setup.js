/* global customElements */

import FetchCss from '../../src/es/components/controllers/fetchCss/FetchCss.js'
import FetchHtml from '../../src/es/components/controllers/fetchHtml/FetchHtml.js'
import FetchModules from '../../src/es/components/controllers/fetchModules/FetchModules.js'

if (!customElements.get('c-fetch-css')) customElements.define('c-fetch-css', FetchCss)
if (!customElements.get('c-fetch-html')) customElements.define('c-fetch-html', FetchHtml)
if (!customElements.get('c-fetch-modules')) customElements.define('c-fetch-modules', FetchModules)

const wcConfig = document.createElement('script')
wcConfig.src = '/wc-config.js?triggerImmediately=true&hash=20260813120000&useDefaultDirectories=false'
document.body.appendChild(wcConfig)
