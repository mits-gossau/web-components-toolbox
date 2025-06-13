// @ts-check
import { Shadow } from '../../prototypes/Shadow.js'

/**
* @export
* @class SkipToNavigation
* @type {CustomElementConstructor}
*/
export default class SkipToNavigation extends Shadow() {
  constructor (options = {}, ...args) {
    super({ importMetaUrl: import.meta.url, ...options }, ...args)

    this.focusinEventListener = () => {
      this.skipToNav.classList.add('active')
      const firstAnchor = this.skipToNav.querySelector('a')
      if (firstAnchor) firstAnchor.focus()
    }

    this.focusoutEventListener = () => {
      this.skipToNav.classList.remove('active')
    }

    this.keyupEventListener = (event) => {
      const activeElement = this.shadowRoot.activeElement || document.activeElement
      if (event.key === 'Escape' || event.key === 'Esc' || event.key === 'Enter' || event.key === ' ') {
        setTimeout(() => {
          // @ts-ignore
          activeElement.blur()
          this.skipToNav.classList.remove('active')
        }, 50)
      }
      if (event.key === 'Enter' && activeElement.href.includes('#navigation')) { 
        this.dispatchEvent(new CustomEvent(this.getAttribute('open-and-focus-nav') || 'open-and-focus-nav', {
          bubbles: true,
          cancelable: true,
          composed: true
        }))
      }
      if (event.key === 'Enter' && activeElement.href.includes('#footer')) { 
        this.dispatchEvent(new CustomEvent(this.getAttribute('open-and-focus-footer') || 'open-and-focus-footer', {
          bubbles: true,
          cancelable: true,
          composed: true
        }))
      }
    }
  }

  connectedCallback () {
    // @ts-ignore
    this.hidden = true
    const showPromises = []
    if (this.shouldRenderCSS()) showPromises.push(this.renderCSS())
    if (this.shouldRenderHTML()) showPromises.push(this.renderHTML())
      console.log('SkipToNavigation component connected', showPromises)
    Promise.all(showPromises).then(() => {
      this.hidden = false
      this.moveChildrenToSlot()
      // @ts-ignore
      if (document.body.firstChild !== this) document.body.insertBefore(this, document.body.firstChild)
    })
    this.addEventListener('focusin', () => this.focusinEventListener())
    this.addEventListener('focusout', () => this.focusoutEventListener())
    this.addEventListener('keyup', (event) => this.keyupEventListener(event))
  }

  disconnectedCallback () {
    this.removeEventListener('focusin', () => this.focusinEventListener())
    this.removeEventListener('focusout', () => this.focusoutEventListener())
    this.removeEventListener('keyup', (event) => this.keyupEventListener(event))
  }

  moveChildrenToSlot () {
    Array.from(this.shadowRoot.children).forEach((child) => { if (child.tagName === 'A') this.skipToNav.appendChild(child) })
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
        <h2>${this.hasAttribute('label') ? this.getAttribute('label') : 'Skip to navigation'}</h2>
      </nav>
    `
  }

  get skipToNav () {
    return this.root.querySelector('nav#skip-navigation')
  }
}
