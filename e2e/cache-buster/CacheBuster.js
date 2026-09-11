import { Shadow } from '../../src/es/components/prototypes/Shadow.js'
import CacheBusterChild from './CacheBusterChild.js'
import CacheBusterOptOutChild from './CacheBusterOptOutChild.js?hash='

/* global customElements */

if (!customElements.get('x-cache-buster-child')) customElements.define('x-cache-buster-child', CacheBusterChild)
if (!customElements.get('x-cache-buster-opt-out-child')) customElements.define('x-cache-buster-opt-out-child', CacheBusterOptOutChild)

export default class CacheBuster extends Shadow() {
  constructor (...args) {
    super({ importMetaUrl: import.meta.url }, ...args)
  }

  connectedCallback () {
    this.fetchCSS([{ path: `${this.importMetaUrl}CacheBuster.css` }], false)
    this.fetchHTML([`${this.importMetaUrl}CacheBuster.html?variant=test`], false)
  }
}
