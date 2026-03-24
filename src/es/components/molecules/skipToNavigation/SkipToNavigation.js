// @ts-check
import { Shadow } from '../../prototypes/Shadow.js'

/**
* @export
* @class SkipToNavigation
* @type {CustomElementConstructor}
*/
export default class SkipToNavigation extends Shadow() {
  constructor (options = {}, ...args) {
    super({ importMetaUrl: import.meta.url,  ...options }, ...args)

    this.focusinEventListener = () => {
      this.skipToNav.classList.add('active')
    }

    this.focusoutEventListener = () => {
      setTimeout(() => {
        if (!this.skipToNav.contains(this.shadowRoot.activeElement)) {
          this.skipToNav.classList.remove('active')
        }
      }, 0)
    }

    this.keyupEventListener = (event) => {
      const activeElement = this.shadowRoot.activeElement || document.activeElement
      if (event.key === 'Escape' || event.key === 'Esc') {
        // @ts-ignore
        activeElement.blur()
        this.skipToNav.classList.remove('active')
      }
      if (event.key === 'Enter' && activeElement.href) {
        if (activeElement.href.includes('#navigation')) {
          this.dispatchEvent(new CustomEvent(this.getAttribute('open-and-focus-nav') || 'open-and-focus-nav', {
            bubbles: true,
            cancelable: true,
            composed: true
          }))
        } else {
          this.dispatchEvent(new CustomEvent(this.getAttribute('close-other-flyout') || 'close-other-flyout', {
            bubbles: true,
            cancelable: true,
            composed: true
          }))
        }
        if (activeElement.href.includes('#footer')) {
          this.dispatchEvent(new CustomEvent(this.getAttribute('open-and-focus-footer') || 'open-and-focus-footer', {
            bubbles: true,
            cancelable: true,
            composed: true
          }))
        }
        this.focusTarget(activeElement.getAttribute('href'))
        this.skipToNav.classList.remove('active')
      }
    }

    this.keyboardShortcutListener = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key.toLowerCase() === 's') {
        event.preventDefault()
        this.skipToNav.classList.toggle('active')
        if (this.skipToNav.classList.contains('active')) {
          const firstLink = this.skipToNav.querySelector('a')
          if (firstLink) firstLink.focus()
        }
      }
    }

    this.clickEventListener = (event) => {
      const anchor = event.target.closest('a')
      if (anchor) {
        event.preventDefault()
        const href = anchor.getAttribute('href')
        if (href.includes('#navigation')) {
          this.dispatchEvent(new CustomEvent(this.getAttribute('open-and-focus-nav') || 'open-and-focus-nav', {
            bubbles: true,
            cancelable: true,
            composed: true
          }))
        } else {
          this.dispatchEvent(new CustomEvent(this.getAttribute('close-other-flyout') || 'close-other-flyout', {
            bubbles: true,
            cancelable: true,
            composed: true
          }))
        }
        if (href.includes('#footer')) {
          this.dispatchEvent(new CustomEvent(this.getAttribute('open-and-focus-footer') || 'open-and-focus-footer', {
            bubbles: true,
            cancelable: true,
            composed: true
          }))
        }
        this.focusTarget(href)
        this.skipToNav.classList.remove('active')
      }
    }
  }

  connectedCallback () {
    // @ts-ignore
    this.hidden = true
    const showPromises = []
    if (this.shouldRenderCSS()) showPromises.push(this.renderCSS())
    if (this.shouldRenderHTML()) showPromises.push(this.renderHTML())
    Promise.all(showPromises).then(() => {
      this.hidden = false
      this.moveChildrenToSlot()
      // @ts-ignore
      if (document.body.firstChild !== this) document.body.insertBefore(this, document.body.firstChild)
    })
    this.addEventListener('focusin', this.focusinEventListener)
    this.addEventListener('focusout', this.focusoutEventListener)
    this.addEventListener('keyup', this.keyupEventListener)
    this.addEventListener('click', this.clickEventListener)
    document.addEventListener('keydown', this.keyboardShortcutListener)
  }

  disconnectedCallback () {
    this.removeEventListener('focusin', this.focusinEventListener)
    this.removeEventListener('focusout', this.focusoutEventListener)
    this.removeEventListener('keyup', this.keyupEventListener)
    this.removeEventListener('click', this.clickEventListener)
    document.removeEventListener('keydown', this.keyboardShortcutListener)
  }

  moveChildrenToSlot () {
    if (!this.skipToNav) return
    const linkNodes = Array.from(this.shadowRoot.children).filter(child => child.tagName === 'A')
    const accesskeys = { '#content': '1', '#navigation': '2', '#footer': '3' }
    linkNodes.forEach(link => {
      link.setAttribute('tabindex', '0')
      const href = link.getAttribute('href')
      if (href && accesskeys[href]) link.setAttribute('accesskey', accesskeys[href])
      this.skipToNav.appendChild(link)
    })
  }

  focusTarget (href) {
    if (!href) return
    const id = href.replace('#', '')
    const target = document.getElementById(id)
    if (!target) return
    const focusable = target.querySelector('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"]), h1, h2, h3, h4, h5, h6')
    if (focusable) {
      if (!focusable.hasAttribute('tabindex')) focusable.setAttribute('tabindex', '-1')
      focusable.focus()
    } else {
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1')
      target.focus()
    }
  }

  /**
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldRenderCSS () {
    return !this.root.querySelector(`${this.cssSelector} > style[_css]`)
  }

  /**
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldRenderHTML () {
    return !this.skipToNav
  }

  /**
   * renders the css
   * @returns Promise<void>
   */
  renderCSS () {
    this.css = /* css */`
      :host > nav {
        position: fixed;
        z-index: var(--z-index, 1001);
        top: 0;
        left: -9999px;
        transform: translateX(-9999px);
        padding: var(--padding, 1rem);
        box-shadow: var(--box-shadow, 0 2px 4px rgba(0, 0, 0, 0.1));
        background-color: var(--background-color, #fff);
      }
      :host:focus-within > nav,
      :host > nav:focus,
      :host > nav:focus-within,
      :host > nav.active {
        left: 0;
        transform: translateX(0);
      }
      :host > nav > h2 {
        border: 0;
        clip: rect(0 0 0 0);
        height: 1px;
        margin: 0;
        overflow: hidden;
        padding: 0;
        position: absolute;
        width: 1px;
        white-space: nowrap;
      }
      :host > nav > a {
        display: block !important;
        color: var(--link-color, #007bff);
        text-decoration: none;
        margin-bottom: var(--margin-bottom, 0.5rem);
        font-family: var(--font-family, inherit);
        font-size: var(--font-size, 1rem);
        font-weight: var(--font-weight, 500);
        line-height: var(--line-height, 1.5);
        letter-spacing: var(--letter-spacing, 0.02em);
        transition: color 0.3s ease;
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
        path: `${this.importMetaUrl}../../../../css/reset.css`,
        namespace: false
      },
      {
        path: `${this.importMetaUrl}../../../../css/style.css`,
        namespaceFallback: true
      }
    ]
    switch (this.getAttribute('namespace')) {
      case 'skip-to-navigation-default-':
        return this.fetchCSS([{
          path: `${this.importMetaUrl}./default-/default-.css`,
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
  renderHTML () {
    this.html = /* html */`
      <nav aria-label="Skip links" id="skip-navigation">
        <h2>Skip links</h2>
      </nav>
    `
  }

  get skipToNav () {
    return this.root.querySelector('nav#skip-navigation')
  }
}
