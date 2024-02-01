// @ts-check
import { Shadow } from '../../prototypes/Shadow.js'

/**
* @export
* @class Dialog
* In Progress
* https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dialog
* @type {CustomElementConstructor}
*/
export default class Dialog extends Shadow() {
  constructor (options = {}, ...args) {
    super({ importMetaUrl: import.meta.url, ...options }, ...args)

    /**
     * @param {'show'|'showModal'} [command='show']
     */
    const show = (command = 'show') => {
      this.dialog.classList.remove('closed')
      this.dialog[command]()
      Array.from(this.dialog.querySelectorAll('[autofocus]')).forEach(node => node.focus())
    }
    const close = () => {
      this.dialog.classList.add('closed')
      setTimeout(() => this.dialog.close(), this.getAttribute('namespace') === 'dialog-top-slide-in-' || this.getAttribute('namespace') === 'dialog-left-slide-in-'
        ? 300
        : 0)
    }

    this.clickEventListener = event => {
      // click on backdrop
      if (event.composedPath()[0] === this.dialog) {
        const rect = this.dialog.getBoundingClientRect()
        if (event.clientY < rect.top || event.clientY > rect.bottom || event.clientX < rect.left || event.clientX > rect.right) close()
        return
      }
      const target = event.composedPath().find(node => node.hasAttribute && node.hasAttribute('id'))
      if (!target) return
      switch (target.getAttribute('id')) {
        case 'show':
          show()
          break
        case 'show-modal':
        case 'open':
          show('showModal')
          break
        case 'close':
          close()
          break
      }
    }
  }

  connectedCallback () {
    if (this.shouldRenderCSS()) this.renderCSS()
    if (this.shouldRenderHTML()) this.renderHTML()
    this.addEventListener('click', this.clickEventListener)
  }

  disconnectedCallback () {
    this.removeEventListener('click', this.clickEventListener)
  }

  /**
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldRenderCSS () {
    return !this.root.querySelector(`:host > style[_css], ${this.tagName} > style[_css]`)
  }

  /**
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldRenderHTML () {
    return !this.dialog
  }

  /**
   * renders the css
   */
  renderCSS () {
    return this.fetchTemplate()
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
      case 'dialog-default-':
        return this.fetchCSS([{
          path: `${this.importMetaUrl}./default-/default-.css`, // apply namespace since it is specific and no fallback
          namespace: false
        }, ...styles])
      case 'dialog-top-slide-in-':
        return this.fetchCSS([{
          path: `${this.importMetaUrl}./top-slide-in-/top-slide-in-.css`, // apply namespace since it is specific and no fallback
          namespace: false
        }, ...styles])
      case 'dialog-left-slide-in-':
        return this.fetchCSS([{
          path: `${this.importMetaUrl}./left-slide-in-/left-slide-in-.css`, // apply namespace since it is specific and no fallback
          namespace: false
        }, ...styles])
      case 'dialog-left-slide-in-without-background-':
        return this.fetchCSS([{
          path: `${this.importMetaUrl}./left-slide-in-without-background-/left-slide-in-without-background-.css`, // apply namespace since it is specific and no fallback
          namespace: false
        }, ...styles])
      default:
        return this.fetchCSS(styles)
    }
  }

  /**
   * Render HTML
   * @returns void
   */
  renderHTML () {
    this.html = /* html */`
      <dialog
        ${
          this.hasAttribute('open')
            ? 'open'
            : ''
        }
        ${
          this.hasAttribute('autofocus')
           ? 'autofocus'
           : ''
        }
      ></dialog>
    `
    Array.from(this.root.children).forEach(node => {
      if (node === this.dialog || node.getAttribute('slot') || node.nodeName === 'STYLE') return false
      if (node.getAttribute('id')?.includes('show') || node.getAttribute('id') === 'open') return (this.html = node)
      this.dialog.appendChild(node)
    })
  }

  get dialog () {
    return this.root.querySelector('dialog')
  }
}
