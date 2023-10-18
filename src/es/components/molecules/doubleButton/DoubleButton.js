// @ts-check
import { Shadow } from '../../prototypes/Shadow.js'

/* global CustomEvent */

/**
 * Creates an DoubleButton
 * https://www.figma.com/file/npi1QoTULLWLTGM4kMPUtZ/Components-Universal?node-id=2866%3A55901
 *
 * @export
 * @attribute {namespace} namespace
 * @type {CustomElementConstructor}
 */
export default class DoubleButton extends Shadow() {
  constructor (options = {}, ...args) {
    // @ts-ignore
    super({ hoverInit: undefined, importMetaUrl: import.meta.url, ...options }, ...args)
  }

  connectedCallback () {
    if (this.shouldRenderCSS()) this.renderCSS()
  }

  /**
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldRenderCSS () {
    return !this.root.querySelector('style[_css]')
  }

  /**
   * renders the css
   *
   * @return {Promise<void>}
   */
  renderCSS () {
    this.css = /* css */`
      :host {
        --justify-content: flex-start;
        display: flex;
        width: fit-content;
      }
      :host > *:first-of-type {
        flex-grow: 1;
      }
      :host > *::part(button) {
        height: 100%;
      }
      :host > *:first-of-type::part(button) {
        border-radius: var(--border-radius, 0.5em) 0 0 var(--border-radius, 0.5em);
      }
      :host > *:last-of-type::part(button) {
        border-radius: 0 var(--border-radius, 0.5em) var(--border-radius, 0.5em) 0;
        margin-left: 1px;
      }
    `
    return this.fetchTemplate()
  }

  /**
   * fetches the template
   *
   * @return {Promise<void>}
   */
  fetchTemplate () {
    const replaces = this.buttonTagName === 'a'
      ? [{
          pattern: '([^-]{1})button',
          flags: 'g',
          replacement: '$1a'
        }]
      : []
    switch (this.getAttribute('namespace')) {
      case 'double-button-default-':
        return this.fetchCSS([{
          // @ts-ignore
          path: `${this.importMetaUrl}./default-/default-.css`,
          namespace: false,
          replaces
        }])
      default:
        return Promise.resolve()
    }
  }
}
