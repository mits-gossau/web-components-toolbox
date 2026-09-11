import { Shadow } from '../../src/es/components/prototypes/Shadow.js'

export default class CacheBusterChild extends Shadow() {
  constructor (...args) {
    super({ importMetaUrl: import.meta.url }, ...args)
  }

  connectedCallback () {
    this.fetchModules([{
      path: `${this.importMetaUrl}CacheBusterDependency.js?variant=test`,
      name: 'x-cache-buster-dependency',
      node: this
    }], false)
  }
}
