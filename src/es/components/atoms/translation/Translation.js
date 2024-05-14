// @ts-check
import { Shadow } from '../../prototypes/Shadow.js'

/* global CustomEvent */

/**
* @export
* @class Translation
* @type {CustomElementConstructor}
*/
export default class Translation extends Shadow() {
  constructor(options = {}, ...args) {
    super({ importMetaUrl: import.meta.url, mode: "false", ...options }, ...args)
  }

  connectedCallback() {
    this.hidden = true
    this.key = this.getAttribute('data-trans-key') || this.getAttribute('key')
    this.renderHTML();
    (new Promise(resolve => this.dispatchEvent(new CustomEvent('request-translations', {
      detail: {
        resolve
      },
      bubbles: true,
      cancelable: true,
      composed: true
    }
    )))).then(async ({ getTranslation }) => {
      if (this.key) this.renderHTML(await getTranslation(this.key))
    }).finally(() => {
      this.hidden = false
    })
  }

  /**
   * Render HTML
   * @returns void
   */
  renderHTML(text = this.key || '[No translation key]') {
    this.html = ''
    this.html = text
  }
}
