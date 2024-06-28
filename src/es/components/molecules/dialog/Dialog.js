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
  constructor(options = {}, ...args) {
    super({ importMetaUrl: import.meta.url, ...options }, ...args)

    /**
     * @param {'show'|'showModal'} [command='show']
     */
    this.show = async (command = this.getAttribute('command-show') || 'show-modal') => {
      const dialog = await this.dialogPromise
      if (this.hasAttribute('close-other-flyout')) this.dispatchEvent(new CustomEvent(this.getAttribute('close-other-flyout') || 'close-other-flyout', { bubbles: true, cancelable: true, composed: true }))
      // @ts-ignore
      command = command.replace(/-([a-z]{1})/g, (match, p1) => p1.toUpperCase())
      this.dispatchEvent(new CustomEvent('no-scroll', { detail: { hasNoScroll: true }, bubbles: true, cancelable: true, composed: true }))
      dialog.classList.remove('closed')
      // @ts-ignore
      dialog[command]()
      // @ts-ignore
      Array.from(dialog.querySelectorAll('[autofocus]')).forEach(node => node.focus())
    }
    this.close = async () => {
      this.root.querySelector('dialog a-input').root.querySelector('div > input').blur()
      const dialog = await this.dialogPromise
      this.dispatchEvent(new CustomEvent('no-scroll', { bubbles: true, cancelable: true, composed: true }))
      dialog.classList.add('closed')
      dialog.close()
    }

    this.clickEventListener = async event => {
      const dialog = await this.dialogPromise
      // click on backdrop
      if (!this.hasAttribute('no-backdrop-close') && event.composedPath()[0] === dialog) {
        const rect = dialog.getBoundingClientRect()
        if (event.clientY < rect.top || event.clientY > rect.bottom || event.clientX < rect.left || event.clientX > rect.right) {
          event.stopPropagation()
          this.close()
          this.dispatchEvent(new CustomEvent(this.getAttribute('backdrop-clicked') || 'backdrop-clicked', { bubbles: true, cancelable: true, composed: true }))
        }
      }
    }
    this.showClickEventListener = event => {
      event.stopPropagation()
      if (event.target.getAttribute('id') === 'show') {
        this.show().then(() => this.detectIOSAutofocusInput())
      } else {
        this.show('showModal').then(() => this.detectIOSAutofocusInput())
      }
    }
    this.closeClickEventListener = event => {
      event.stopPropagation()
      this.close()
    }
    this.showEventListener = event => this.show(event.detail.command)
    this.closeEventListener = () => this.close()
    this.keyupListener = event => {
      if (event.key === 'Escape') this.close()
    }

    /** @type {(any)=>void} */
    this.dialogResolve = map => map
    /** @type {Promise<HTMLDialogElement>} */
    this.dialogPromise = new Promise(resolve => (this.dialogResolve = resolve))
  }

  connectedCallback() {
    this.hidden = true
    this.showNodes.forEach(node => (node.style.display = 'none'))
    this.closeNodes.forEach(node => (node.style.display = 'none'))
    const showPromises = []
    if (this.shouldRenderCSS()) showPromises.push(this.renderCSS())
    Promise.all(showPromises).then(() => {
      if (this.shouldRenderHTML()) showPromises.push(this.renderHTML())
      Promise.all(showPromises).then(() => {
        this.hidden = false
        this.showNodes.forEach(node => (node.style.display = ''))
        this.closeNodes.forEach(node => (node.style.display = ''))
        if (this.hasAttribute('open')) {
          this.show(this.getAttribute('open') || undefined)
          this.removeAttribute('open')
        }
      })
    })
    // From web components the event does not bubble up to this host
    this.showNodes.forEach(node => node.addEventListener('click', this.showClickEventListener))
    this.closeNodes.forEach(node => node.addEventListener('click', this.closeClickEventListener))
    this.addEventListener('click', this.clickEventListener)
    if (this.getAttribute('show-event-name')) document.body.addEventListener(this.getAttribute('show-event-name'), this.showEventListener)
    if (this.getAttribute('close-event-name')) document.body.addEventListener(this.getAttribute('close-event-name'), this.closeEventListener)
    document.addEventListener('keyup', this.keyupListener)
  }

  disconnectedCallback() {
    // From web components the event does not bubble up to this host
    this.showNodes.forEach(node => node.removeEventListener('click', this.showClickEventListener))
    this.closeNodes.forEach(node => node.removeEventListener('click', this.closeClickEventListener))
    this.removeEventListener('click', this.clickEventListener)
    if (this.getAttribute('show-event-name')) document.body.removeEventListener(this.getAttribute('show-event-name'), this.showEventListener)
    if (this.getAttribute('close-event-name')) document.body.removeEventListener(this.getAttribute('close-event-name'), this.closeEventListener)
    document.removeEventListener('keyup', this.keyupListener)
  }

  /**
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldRenderCSS() {
    return !this.root.querySelector(`${this.cssSelector} > style[_css]`)
  }

  /**
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldRenderHTML() {
    return !this.dialog
  }

  /**
   * renders the css
   */
  renderCSS() {
    this.css = /* css */`
      :host {
        --outline-style: none;
        outline: none;
      }
      :host > dialog {
        background-color: var(--background-color, canvas);
      }
      :host > dialog {
        cursor: var(--dialog-cursor, auto);
      }
      :host > dialog::backdrop {
        cursor: var(--dialog-backdrop-cursor, pointer);
      }
    `
    return this.fetchTemplate()
  }

  /**
   * fetches the template
   */
  fetchTemplate() {
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
        }, ...styles], false)
      case 'dialog-top-slide-in-':
        return this.fetchCSS([{
          path: `${this.importMetaUrl}./top-slide-in-/top-slide-in-.css`, // apply namespace since it is specific and no fallback
          namespace: false
        }, ...styles], false)
      case 'dialog-left-slide-in-':
        return this.fetchCSS([{
          path: `${this.importMetaUrl}./left-slide-in-/left-slide-in-.css`, // apply namespace since it is specific and no fallback
          namespace: false
        }, ...styles], false)
      case 'dialog-left-slide-in-wide-':
        return this.fetchCSS([{
          path: `${this.importMetaUrl}./left-slide-in-wide-/left-slide-in-wide-.css`, // apply namespace since it is specific and no fallback
          namespace: false
        }, ...styles], false)
      case 'dialog-left-slide-in-without-background-':
        return this.fetchCSS([{
          path: `${this.importMetaUrl}./left-slide-in-without-background-/left-slide-in-without-background-.css`, // apply namespace since it is specific and no fallback
          namespace: false
        }, ...styles], false)
      case 'dialog-left-slide-in-checkout-':
        return this.fetchCSS([{
          path: `${this.importMetaUrl}./left-slide-in-checkout-/left-slide-in-checkout-.css`, // apply namespace since it is specific and no fallback
          namespace: false
        }, ...styles], false)
      default:
        return this.fetchCSS(styles)
    }
  }

  /**
   * Render HTML
   * @returns Promise<void>
   */
  renderHTML() {
    this.dialogResolve(this.dialog = this.root.querySelector(this.cssSelector + ' > dialog') || document.createElement('dialog'))
    if (this.hasAttribute('autofocus')) this.dialog.setAttribute('autofocus', '')
    Array.from(this.root.children).forEach(node => {
      if (node === this.dialog || node.getAttribute('slot') || node.nodeName === 'STYLE') return false
      if (node.getAttribute('id')?.includes('show') || node.getAttribute('id') === 'open') return false
      if (node.getAttribute('id') === 'close') return this.dialog.prepend(node)
      this.dialog.appendChild(node)
    })
    this.html = this.dialog
    return Promise.resolve()
  }

  detectIOSAutofocusInput() {
    // @ts-ignore
    let customInput = this.constructor.isIOS && this.root.querySelector('dialog [autofocus], dialog [autofocus-helper]')
    if (customInput) {
      // console.log("customInput before",  customInput)
      // customInput.dispatchEvent(new KeyboardEvent('touchstart',{
      //   bubbles: true,
      //   cancelable: true,
      //   composed: true
      // }))
      if (customInput.root) customInput = customInput.root.querySelector(':host input')
      const tmpElement = document.createElement('input')
      tmpElement.style.width = '0'
      tmpElement.style.height = '0'
      tmpElement.style.margin = '0'
      tmpElement.style.padding = '0'
      tmpElement.style.border = '0'
      tmpElement.style.opacity = '0'
      document.body.appendChild(tmpElement)
      tmpElement.focus()

      setTimeout(() => {
         // Focus the main (input) element, thus opening iOS keyboard
        customInput.focus()
        tmpElement.remove()
      }, 0);
    }
  }

  get showNodes() {
    return Array.from(this.root.querySelectorAll('[id^=show],[id=open]'))
  }

  get closeNodes() {
    return Array.from(this.root.querySelectorAll('[id^=close]'))
  }
}
