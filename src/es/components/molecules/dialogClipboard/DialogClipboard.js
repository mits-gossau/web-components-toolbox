// @ts-check
import Dialog from '../dialog/Dialog.js'

/* global alert */

/**
* Implements the Web API Clipboard in combination to a dialog field
*
* @export
* @class Dialog
* https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dialog
* https://developer.mozilla.org/en-US/docs/Web/API/Clipboard
* @type {CustomElementConstructor}
*/
export default class DialogClipboard extends Dialog {
  constructor (options = {}, ...args) {
    super({ ...options }, ...args)

    const superShow = this.show
    this.show = command => {
      this.copy()
      return superShow(command)
    }

    let transitionendTimeout = null
    this.transitionendEventListener = event => {
      clearTimeout(transitionendTimeout)
      transitionendTimeout = setTimeout(() => {
        if (this.dialog.hasAttribute('open')) this.close()
      }, this.getAttribute('duration') || 1000)
    }
  }

  connectedCallback () {
    if (this.shouldRenderCustomHTML()) this.renderCustomHTML()
    const showPromises = super.connectedCallback()
    Promise.all(showPromises).then(() => this.dialog.addEventListener('transitionend', this.transitionendEventListener))
    return showPromises
  }

  disconnectedCallback () {
    this.dialog.removeEventListener('animationend', this.transitionendEventListener)
    return super.disconnectedCallback()
  }

  /**
     * evaluates if a render is necessary
     *
     * @return {boolean}
     */
  shouldRenderCustomHTML () {
    return !this.root.querySelector(this.cssSelector + ' > dialog')
  }

  /**
   * renders the css
   */
  renderCSS () {
    const result = super.renderCSS()
    this.setCss(/* css */`
      :host > dialog {
        user-select: none;
        scrollbar-color: var(--scrollbar-color, var(--color) var(--background-color));
        scrollbar-width: var(--scrollbar-width, thin);
      }
    `, undefined, false)
    return result
  }

  /**
   * fetches the template
   */
  fetchTemplate () {
    /** @type {import("../../prototypes/Shadow.js").fetchCSSParams[]} */
    const styles = [
      {
        path: `${this.importMetaUrl}../../../../css/reset.css`, // no variables for this reason no namespace
        namespace: false
      },
      {
        path: `${this.importMetaUrl}../../../../css/style.css`, // apply namespace and fallback to allow overwriting on deeper level
        namespaceFallback: true
      }
    ]
    switch (this.getAttribute('namespace')) {
      case 'dialog-clipboard-default-':
        return this.fetchCSS([{
          path: `${this.importMetaUrl}./default-/default-.css`, // apply namespace since it is specific and no fallback
          namespace: false,
          replaces: [{
            pattern: '--dialog-default-',
            flags: 'g',
            replacement: '--dialog-clipboard-default-'
          }]
        }, {
          path: `${this.importMetaUrl}../dialogClipboard/default-/default-.css`, // apply namespace since it is specific and no fallback
          namespace: false
        }, ...styles], false)
      default:
        return super.fetchTemplate()
    }
  }

  /**
   * Render HTML
   * @returns void
   */
  renderCustomHTML () {
    this.copyValue = this.template.content.textContent
    this.template.remove()
    this.html = /* html */`
      <dialog>
        <h4>${this.getAttribute('copied-text') || 'Copied: '}"${this.copyValue}"</h4>
      </dialog>
    `
  }

  async copy () {
    if (!this.copyValue) return
    try {
      await navigator.clipboard.writeText(this.copyValue)
    } catch (error) {
      alert(`${this.getAttribute('copy-manually-text') || 'Copy manually: '}\n${this.copyValue}`)
    }
  }

  get template () {
    return this.root.querySelector('template')
  }
}
