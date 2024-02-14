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
    this.show = (command = 'show') => {
      this.dispatchEvent(new CustomEvent('no-scroll', { detail: { hasNoScroll: true }, bubbles: true, cancelable: true, composed: true }))
      this.dialog.classList.remove('closed')
      this.dialog[command]()
      Array.from(this.dialog.querySelectorAll('[autofocus]')).forEach(node => node.focus())
    }
    this.close = () => {
      this.dispatchEvent(new CustomEvent('no-scroll', { bubbles: true, cancelable: true, composed: true }))
      this.dialog.classList.add('closed')
      setTimeout(() => this.dialog.close(), this.getAttribute('namespace') === 'dialog-top-slide-in-' || this.getAttribute('namespace') === 'dialog-left-slide-in-'
        ? 300
        : 0)
    }

    this.clickEventListener = event => {
      // click on backdrop
      if (event.composedPath()[0] === this.dialog) {
        const rect = this.dialog.getBoundingClientRect()
        if (event.clientY < rect.top || event.clientY > rect.bottom || event.clientX < rect.left || event.clientX > rect.right) {
          event.stopPropagation()
          this.close()
        }
      }
    }
    this.showClickEventListener = event => {
      event.stopPropagation()
      if (event.target.getAttribute('id') === 'show') {
        this.show()
      } else {
        this.show('showModal')
      }
    }
    this.closeClickEventListener = event => {
      event.stopPropagation()
      this.close()
    }
  }

  connectedCallback () {
    if (this.shouldRenderCSS()) this.renderCSS()
    if (this.shouldRenderHTML()) this.renderHTML()
    this.addEventListener('click', this.clickEventListener)
    // From web components the event does not bubble up to this host
    this.showNodes.forEach(node => node.addEventListener('click', this.showClickEventListener))
    this.closeNodes.forEach(node => node.addEventListener('click', this.closeClickEventListener))
  }

  disconnectedCallback () {
    this.removeEventListener('click', this.clickEventListener)
    // From web components the event does not bubble up to this host
    this.showNodes.forEach(node => node.removeEventListener('click', this.showClickEventListener))
    this.closeNodes.forEach(node => node.removeEventListener('click', this.closeClickEventListener))
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
    this.css = /* css */`
      :host > dialog {
        background-color: var(--background-color, canvas);x
      }
    `
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

  get showNodes () {
    return Array.from(this.root.querySelectorAll('[id^=show],[id=open]'))
  }

  get closeNodes () {
    return Array.from(this.root.querySelectorAll('[id^=close]'))
  }
}
