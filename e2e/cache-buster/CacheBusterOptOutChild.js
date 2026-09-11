import { Shadow } from '../../src/es/components/prototypes/Shadow.js'

export default class CacheBusterOptOutChild extends Shadow() {
  constructor (...args) {
    super({ importMetaUrl: import.meta.url }, ...args)
  }

  connectedCallback () {
    this.fetchModules([{
      path: `${this.importMetaUrl}CacheBusterOptOutDependency.js?variant=test`,
      name: 'x-cache-buster-opt-out-dependency',
      node: this
    }], false)
  }
}
