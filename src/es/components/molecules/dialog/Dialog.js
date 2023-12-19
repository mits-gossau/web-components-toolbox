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

    this.clickEventListener = event => {
      const target = event.composedPath()[0]
      if (!target) return
      switch (target.getAttribute('id')) {
        case 'show':
          this.dialog.classList.remove('closed')
          this.dialog.show()
          break
        case 'show-modal':
        case 'open':
          this.dialog.classList.remove('closed')
          this.dialog.showModal()
          break
        case 'close':
          this.dialog.classList.add('closed')
          setTimeout(() => {
            this.dialog.close()
          }, 300)
          break
        case null: // click on backdrop
          if (target === this.dialog) {
            this.dialog.classList.add('closed')
            setTimeout(() => {
              this.dialog.close()
            }, 300)
          }
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
    this.css = /* css */`
      /*   Open state of the dialog  */
      :host > dialog[open] {
        opacity: 1;
        transform: scaleY(1);
      }
      /*   Closed state of the dialog   */
      :host > dialog {
        opacity: 0;
        position: fixed;
        transform: scaleY(0);
        transition:
          opacity 0.7s ease-out,
          transform 0.7s ease-out,
          overlay 0.7s ease-out allow-discrete,
          display 0.7s ease-out allow-discrete;
        /* Equivalent to
        transition: all 0.7s allow-discrete; */
        z-index: 99;
      }
      /*   Before-open state  */
      /* Needs to be after the previous dialog[open] rule to take effect,
          as the specificity is the same */
      @starting-style {
        :host > dialog[open] {
          opacity: 0;
          transform: scaleY(0);
        }
      }
      /* Transition the :backdrop when the dialog modal is promoted to the top layer */
      :host > dialog::backdrop {
        background-color: rgb(0 0 0 / 0);
        transition:
          display 0.7s allow-discrete,
          overlay 0.7s allow-discrete,
          background-color 0.7s;
        /* Equivalent to
        transition: all 0.7s allow-discrete; */
      }
      :host > dialog[open]::backdrop {
        background-color: rgb(0 0 0 / 0.25);
      }
      /* This starting-style rule cannot be nested inside the above selector
      because the nesting selector cannot represent pseudo-elements. */
      @starting-style {
        :host > dialog[open]::backdrop {
          background-color: rgb(0 0 0 / 0);
        }
      }
      :host #overlay {
        height: 100%;
        width: 100%;
        position: absolute;
        top: 0;
        left: 0;
        z-index: -1;
      }
      @media only screen and (max-width: _max-width_) {
        :host {}
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
      default:
        return this.fetchCSS(styles)
    }
  }

  /**
   * Render HTML
   * @returns void
   */
  renderHTML () {
    const overlay = document.createElement('div')
    overlay.setAttribute('id', 'overlay')
    this.root.appendChild(overlay)

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
      if (node.getAttribute('id')?.includes('show') || node.getAttribute('id') === 'open') return this.html = node
      this.dialog.appendChild(node)
    })
  }

  get dialog () {
    return this.root.querySelector('dialog')
  }
}
