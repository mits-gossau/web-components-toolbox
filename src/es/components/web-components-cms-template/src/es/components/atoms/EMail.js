// @ts-check
import { Shadow } from '../prototypes/Shadow.js'

/* global location */

/**
 * Email
 * Avoids writing the email address straight as user@domain.com to avoid span
 *
 * @export
 * @class Email
 * @type {CustomElementConstructor}
 * @attribute {
 *  {string} local-part expl.: user
 *  {string} [domain=${location.hostname}] expl.: domain.com
 *  {string} [subject='']
 * }
 */
export default class Email extends Shadow() {
  constructor (...args) {
    super({ mode: 'false' }, ...args)

    this.clickListener = event => {
      event.preventDefault()
      // location.hostname.replace('www.', '')
      const a = document.createElement('a')
      a.setAttribute('href', `mailto:${this.getAttribute('local-part') || 'set "local-part"'}@${this.getAttribute('domain') || location.hostname.replace('www.', '')}${this.hasAttribute('subject') ? `?subject=${this.getAttribute('subject') || 'set a subject'}` : ''}`)
      a.click()
    }
  }

  connectedCallback () {
    if (this.shouldComponentRenderHTML()) this.renderHTML()
    this.addEventListener('click', this.clickListener)
  }

  disconnectedCallback () {
    this.removeEventListener('click', this.clickListener)
  }

  /**
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldComponentRenderHTML () {
    return !this.root.querySelector('a')
  }

  /**
   * renders the html
   *
   * @return {void}
   */
  renderHTML () {
    const textContent = this.textContent || 'set the textContent to be displayed for this e-mail link!'
    this.textContent = ''
    this.html = /* HTML */`<a href=#${textContent}>${textContent}</a>`
  }
}
