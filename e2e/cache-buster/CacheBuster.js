import { Shadow } from '../../src/es/components/prototypes/Shadow.js'

export default class CacheBuster extends Shadow() {
  constructor (...args) {
    super({ importMetaUrl: import.meta.url }, ...args)
  }

  connectedCallback () {
    this.fetchCSS([{ path: `${this.importMetaUrl}CacheBuster.css` }], false)
  }
}
