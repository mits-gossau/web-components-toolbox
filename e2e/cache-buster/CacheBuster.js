import { Shadow } from '../../src/es/components/prototypes/Shadow.js'

export default class CacheBuster extends Shadow() {
  constructor (...args) {
    super({ importMetaUrl: import.meta.url }, ...args)
  }

  connectedCallback () {
    this.fetchCSS([{ path: `${this.importMetaUrl}CacheBuster.css` }], false)
    this.fetchHTML([`${this.importMetaUrl}CacheBuster.html?variant=test`], false)
    this.fetchModules([{
      path: `${this.importMetaUrl}CacheBusterDependency.js?variant=test`,
      name: 'x-cache-buster-dependency',
      node: this
    }], false)
  }
}
