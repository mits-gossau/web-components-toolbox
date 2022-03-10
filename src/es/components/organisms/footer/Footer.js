// @ts-check
import { Shadow } from '../../prototypes/Shadow.js'

/* global Link */
/* global customElements */
/* global Wrapper */

/**
 * Footer is sticky and hosts uls
 * Example at: /src/es/components/organisms/Playlist.html
 * As an organism, this component shall hold molecules and/or atoms
 *
 * @export
 * @class Footer
 * @type {CustomElementConstructor}
 * @attribute {
 * }
 * @css {
 *  NOTE: grid-area: footer;
 *  --background-color [black]
 *  --z-index [100]
 *  --content-spacing [40px]
 *  --a-link-content-spacing [0]
 *  --a-link-font-size [1rem]
 *  --a-link-font-size-2 [1rem]
 *  --list-style [none]
 *  --align-items [start]
 *  --font-size [1rem]
 *  --p-margin [0]
 * }
 */
export default class Footer extends Shadow() {
  connectedCallback () {
    const showPromises = []
    if (this.shouldComponentRenderCSS()) showPromises.push(this.renderCSS())
    if (this.shouldComponentRenderHTML()) showPromises.push(this.renderHTML())
    if (showPromises.length) {
      this.hidden = true
      Promise.all(showPromises).then(() => (this.hidden = false))
    }
  }

  /**
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldComponentRenderCSS () {
    return !this.root.querySelector(`:host > style[_css], ${this.tagName} > style[_css]`)
  }

  /**
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldComponentRenderHTML () {
    return !this.footer
  }

  /**
   * renders the o-footer css
   *
   * @return {Promise<void>}
   */
  renderCSS () {
    this.css = /* css */`
      :host {
        grid-area: footer;
        color: var(--color);
        --a-color: var(--color);
      }
      :host > footer {
        margin: var(--margin, 0);
        padding: var(--padding, 0);
        background-color: var(--color-secondary, var(--background-color));
      }
      :host > footer > * {
        margin: var(--content-spacing, 40px) auto;  /* Warning! Keep horizontal margin at auto, otherwise the content width + margin may overflow into the scroll bar */
        width: var(--content-width, 55%);
      }
      :host > footer > .logo {
        display: block;
        --picture-store-logo-text-align: var(--picture-store-logo-text-align-custom, left);
      }
      :host > footer > o-footer-wrapper {
        --align-items: var(--align-items-custom, normal);
      }
      :host > footer > ul.language-switcher {
        --color: var(--background-color);
        --color-hover: var(--m-orange-300);
        --padding: 1.1429rem 1.2143rem;
        background-color: var(--language-switcher-color-secondary, var(--background-color));
        color: var(--color);
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: center;
        padding: 0;
        margin-right: 0;
        margin-bottom: 0;
        margin-left: 0;
        width: 100%;
      }
      :host > footer > ul.language-switcher > li {
        align-items: center;
        display: flex;
      }
      :host > footer > ul.language-switcher > li.copy {
        padding: var(--footer-padding);
        position: absolute;
        left: 0;
      }
      :host > footer > ul.language-switcher:not(:first-child) {
        margin-top: 1px;
      }
      :host > footer > ul.language-switcher > li {
        border: 0;
        list-style: var(--list-style, none);
        width: auto;
      }
      @media only screen and (max-width: _max-width_) {
        :host {
          --font-size: var(--font-size-mobile);
        }
        :host > footer {
          margin: var(--margin-mobile, var(--margin, 0));
          padding: var(--padding-mobile, var(--padding, 0));
        }
        :host > footer > * {
          margin: var(--content-spacing-mobile, 0) auto; /* Warning! Keep horizontal margin at auto, otherwise the content width + margin may overflow into the scroll bar */
          width: var(--content-width, 90%);
        }
        :host > footer > ul.language-switcher > li.copy {
          position: static;
        }
      }
    `
    /** @type {import("../../prototypes/Shadow.js").fetchCSSParams[]} */
    const styles = [
      {
        path: `${import.meta.url.replace(/(.*\/)(.*)$/, '$1')}../../../../css/reset.css`, // no variables for this reason no namespace
        namespace: false
      },
      {
        path: `${import.meta.url.replace(/(.*\/)(.*)$/, '$1')}../../../../css/style.css`, // apply namespace and fallback to allow overwriting on deeper level
        namespaceFallback: true
      }
    ]
    switch (this.getAttribute('namespace')) {
      case 'footer-default-':
        return this.fetchCSS([{
          path: `${import.meta.url.replace(/(.*\/)(.*)$/, '$1')}./default-/default-.css`, // apply namespace since it is specific and no fallback
          namespace: false
        }, ...styles], false)
      default:
        return this.fetchCSS(styles)
    }
  }

  /**
   * renders the a-link html
   *
   * @return {Promise<void>}
   */
  renderHTML () {
    this.footer = this.root.querySelector('footer') || document.createElement('footer')
    return this.loadChildComponents().then(children => {
      Array.from(this.root.querySelectorAll('li a')).forEach(a => {
        const li = a.parentElement
        const aLink = new children[0][1](a, { namespace: this.getAttribute('namespace') || '', namespaceFallback: this.hasAttribute('namespace-fallback') })
        if (a.classList.contains('active')) aLink.classList.add('active')
        a.replaceWith(aLink)
        li.prepend(aLink)
      })
      const wrapper = new children[1][1]()
      Array.from(this.root.children).forEach(node => {
        if (!node.getAttribute('slot') && node.tagName !== 'STYLE' && node.tagName !== 'HR' && node.tagName !== 'FOOTER' && !node.classList.contains('spacer') && !node.classList.contains('language-switcher') && node !== this.logo) wrapper.root.appendChild(node)
      })
      if (this.logo) this.footer.appendChild(this.logo)
      if (this.root.querySelector('hr')) this.footer.appendChild(this.root.querySelector('hr'))
      this.footer.appendChild(wrapper)
      if (this.root.querySelector('.spacer')) this.footer.appendChild(this.root.querySelector('.spacer'))
      this.languageSwitchers.forEach(languageSwitcher => this.footer.appendChild(languageSwitcher))
      this.html = this.footer
    })
  }

  /**
   * fetch children when first needed
   *
   * @returns {Promise<[string, CustomElementConstructor][]>}
   */
  loadChildComponents () {
    if (this.childComponentsPromise) return this.childComponentsPromise
    let linkPromise
    try {
      linkPromise = Promise.resolve({ default: Link })
    } catch (error) {
      linkPromise = import('../../atoms/link/Link.js')
    }
    let wrapperPromise
    try {
      wrapperPromise = Promise.resolve({ Wrapper: Wrapper })
    } catch (error) {
      wrapperPromise = import('../../organisms/wrapper/Wrapper.js')
    }
    return (this.childComponentsPromise = Promise.all([
      linkPromise.then(
        /** @returns {[string, CustomElementConstructor]} */
        module => ['a-link', module.default]
      ),
      wrapperPromise.then(
        /** @returns {[string, any]} */
        module => [this.getAttribute('o-footer-wrapper') || 'o-footer-wrapper', module.Wrapper()]
      )
    ]).then(elements => {
      elements.forEach(element => {
        // don't define already existing customElements
        // @ts-ignore
        if (!customElements.get(element[0])) customElements.define(...element)
      })
      return elements
    }))
  }

  get wrapper () {
    return this.root.querySelector('o-footer-wrapper')
  }

  get languageSwitchers () {
    return this.root.querySelectorAll('.language-switcher')
  }

  get logo () {
    return this.root.querySelector('.logo')
  }
}
