// @ts-check
import { Shadow } from '../../prototypes/Shadow.js'

/* global CustomEvent */

/**
* @export
* @class Translation
* @type {CustomElementConstructor}
*/
export default class Translation extends Shadow() {
  constructor (options = {}, ...args) {
    super({ importMetaUrl: import.meta.url, tabindex: 'no-tabindex-style', ...options }, ...args)
  }
  static get observedAttributes () {
    return ['data-trans-key', 'key']
  }

  connectedCallback () {
    this.hidden = true
    this.renderHTML()
    this.getTranslationAndRenderHTML().finally(() => (this.hidden = false))
  }

  attributeChangedCallback (name, oldValue, newValue) {
    if (oldValue === null || oldValue === newValue) return
    this.getTranslationAndRenderHTML()
  }

  /**
   * Render HTML
   * @returns void
   */
  renderHTML (text = this.key || '[No translation key]') {
    this.html = ''

    if (this.hasAttribute('replace-line-breaks')) text = text.replaceAll('\n', '<br />')
    if (this.hasAttribute('params')) {
      const params = JSON.parse(this.getAttribute('params')) ?? {}
      Object.keys(params).forEach(key => {
        text = text.replaceAll(`{${key}}`, params[key])
      })
    }

    this.html = text
  }

  getTranslationAndRenderHTML () {
    if (this.key) {
      return (new Promise(resolve => this.dispatchEvent(new CustomEvent('request-translations', {
        detail: {
          resolve
        },
        bubbles: true,
        cancelable: true,
        composed: true
      }
      )))).then(async ({ getTranslation }) => this.renderHTML(await getTranslation(this.key)))
    } else {
      return Promise.reject() // eslint-disable-line prefer-promise-reject-errors
    }
  }

  get key () {
    return this.getAttribute('data-trans-key') || this.getAttribute('key')
  }
}
