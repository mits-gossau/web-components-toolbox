import { Shadow } from '../../src/es/components/prototypes/Shadow.js'
import CacheBusterChild from './CacheBusterChild.js'

/* global customElements */

if (!customElements.get('x-cache-buster-child')) customElements.define('x-cache-buster-child', CacheBusterChild)

export default class CacheBuster extends Shadow() {
  constructor (...args) {
    super({ importMetaUrl: import.meta.url }, ...args)
  }

  connectedCallback () {
    this.fetchCSS([{ path: `${this.importMetaUrl}CacheBuster.css` }], false)
    this.fetchHTML([`${this.importMetaUrl}CacheBuster.html?variant=test`], false)
  }
}
