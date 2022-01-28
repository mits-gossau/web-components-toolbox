// @ts-check
import BaseNavigation from '../web-components-cms-template/src/es/components/molecules/Navigation.js'
import { Shadow } from '../web-components-cms-template/src/es/components/prototypes/Shadow.js'

/* global customElements */
/* global self */
/* global Wrapper */

/**
 * Navigation hosts uls
 * Example at: /src/es/components/pages/Home.html
 * As a molecule, this component shall hold Atoms
 *
 * @export
 * @class Navigation
 * @type {CustomElementConstructor}
 */
export default class Navigation extends BaseNavigation {
  constructor (...args) {
    super(...args)

    this.isDesktop = this.checkMedia('desktop')
    // desktop keep gray background in right position
    this.clickListener = event => {
      this.setFocusLostClickBehavior()
      // header removes no-scroll at body on resize, which must be avoided if navigation is open
      // console.log('changed', this.isDesktop === (this.isDesktop = this.checkMedia('desktop')));
      if (this.hasAttribute('no-scroll') && this.isDesktop === (this.isDesktop = this.checkMedia('desktop')) && ((!this.isDesktop && this.classList.contains('open')) || (this.isDesktop && this.root.querySelector('li.open')))) document.documentElement.classList.add(this.getAttribute('no-scroll') || 'no-scroll')
      let section
      if ((section = this.root.querySelector('li.open section'))) {
        if (this.checkMedia('desktop')) {
          this.style.textContent = /* css */`
          :host > nav > ul > li.open > div.background {
            top: ${section.getBoundingClientRect().bottom}px;
          }
        `
        }
      }
      this.liClickListener(event)
    }
    // on resize or click keep ul open in sync
    // remove open class
    this.liClickListener = event => {
      if (event && event.target) {
        this.root.querySelector('nav > ul:not(.language-switcher)').classList[event.target.parentNode && event.target.parentNode.classList.contains('open') ? 'add' : 'remove']('open')
        if (this.checkMedia('mobile')) {
          Array.from(this.root.querySelectorAll('li.open')).forEach(link => {
            if (link !== event.target.parentNode) link.classList.remove('open')
          })
        }
      }
    }
    // correct the arrow direction when closing the menu on global or parent event
    this.selfClickListener = event => Array.from(this.root.querySelectorAll('nav > ul:not(.language-switcher) > li > a-link')).forEach(aLink => {
      const arrow = aLink.parentNode.querySelector('a-arrow')
      if (arrow) arrow.setAttribute('direction', aLink.classList.contains('open') || aLink.parentNode.classList.contains('open') ? 'left' : 'right')
    })
  }

  connectedCallback () {
    super.connectedCallback()
    self.addEventListener('resize', this.clickListener)
    self.addEventListener('click', this.selfClickListener)
    this.setFocusLostClickBehavior()
  }

  disconnectedCallback () {
    super.disconnectedCallback()
    self.removeEventListener('resize', this.clickListener)
    self.removeEventListener('click', this.selfClickListener)
    this.root.querySelectorAll('a-link').forEach(link => link.removeEventListener('click', this.clickListener))
    this.root.querySelectorAll('nav > ul:not(.language-switcher) > li').forEach(link => link.removeEventListener('click', this.liClickListener))
  }

  /**
   * renders the logistik-m-navigation css
   *
   * @return {void}
   */
  renderCSS () {
    // extend body styles
    super.renderCSS()
    const bodyCss = this.css
      .replace(/:host\s*ul\s*{[^}]*}/g, '')
      .replace(/:host\s*>\s*nav\s*>\s*ul\s*li\s*ul\s*{[^}]*}/g, '')
      .replace(/:host\s*>\s*nav\s*>\s*ul\s*li\s*{[^}]*}/g, '')
    this.css = ''
    this.setCss(bodyCss, undefined, '') // already received its namespace and for that gets set without any ''
    this.css = /* css */`
      :host > nav > ul {
        background-color: var(--background-color);
        margin: 0;
      }
      :host > nav > .language-switcher {
        display: none;
      }
      :host > nav > ul > li {
        margin: var(--margin);
        border-bottom: 2px solid transparent;
        transition: all 0.1s ease;
      }
      :host > nav > ul > li:hover:not(.search) {
        border-bottom: 2px solid var(--color);
      }
      :host > nav > ul li.open {
        border-bottom: 2px solid var(--color-secondary);
      }
      :host > nav > ul > li > div.background {
        cursor: auto;
        display: none;
        position: fixed;
        background-color: var(--m-gray-500);
        width: 100vw;
        height: 100vw;
        left: 0;
        top: 0;
        opacity: 0;
      }
      :host > nav > ul > li.open > div.background {
        display: block;
        opacity: 0.54;
      }
      :host > nav > ul li > ${this.getAttribute('o-nav-wrapper') || 'o-nav-wrapper'} > section {
        --a-link-content-spacing: 0;
        --a-link-font-size: 1rem;
        --a-link-font-weight: normal;
        background-color: var(--background-color, white);
        cursor: auto;
        display: none !important;
        position: absolute;
        left: 0;
        margin-top: 1.7rem;
        overflow: auto;
        box-sizing: border-box;
        max-height: 80vh;
        padding: 2.5rem calc((100% - var(--content-width)) / 2);
        transition: all 0.2s ease;
        z-index: var(--li-ul-z-index, auto);
      }
      :host > nav > ul li.open > ${this.getAttribute('o-nav-wrapper') || 'o-nav-wrapper'} > section {
        display: flex !important;
      }
      :host > nav > ul li.open > ${this.getAttribute('o-nav-wrapper') || 'o-nav-wrapper'} > section > ul > li {
        list-style: var(--list-style, none);
        padding-bottom: 0.5rem;
      }
      :host > nav > ul li.open > ${this.getAttribute('o-nav-wrapper') || 'o-nav-wrapper'} > section > ul > li:first-child, :host > nav > ul li.open > ${this.getAttribute('o-nav-wrapper') || 'o-nav-wrapper'} > section > ul > li.bold {
        --a-link-font-weight: bold;
        --a-link-font-size: 1.25rem;
        padding-bottom: 0.875rem;
      }
      :host > nav > ul > li.search {
        flex-grow: 1;
        display: flex;
        justify-content: flex-end;
        margin-right: 0;
        padding: var(--search-li-padding, var(--li-padding, 0 calc(var(--content-spacing, 40px) / 4)));
        margin-top: -1.5rem;
      }
      @media only screen and (max-width: ${this.getAttribute('mobile-breakpoint') ? this.getAttribute('mobile-breakpoint') : self.Environment && !!self.Environment.mobileBreakpoint ? self.Environment.mobileBreakpoint : '1000px'}) {
        :host {
          --a-link-content-spacing-no-scroll: 1.1429rem 1.2143rem;
          --a-link-content-spacing: var(--a-link-content-spacing-no-scroll);
          --a-link-font-size-mobile: var(--a-link-font-size-no-scroll-mobile);
          --a-link-font-size-mobile: var(--a-link-font-size-no-scroll-mobile);
          --a-link-font-size-no-scroll-mobile: 1.1429rem;
          --a-link-font-weight: normal;
          --a-link-second-level-font-size-mobile: 1.2857rem;
          --a-link-text-align-mobile: left;
          --height: auto;
          --li-padding: 0;
          --margin: 0;
          --min-height-mobile: 0;
          scrollbar-color: var(--color-secondary) var(--background-color);
        }
        :host > nav {
          background-color: var(--background-color, black);
          display: flex;
          flex-direction: column;
          justify-content: flex-start; /* must be up, otherwise the iphone hides it behind the footer bar */
          min-height: calc(100vh - var(--header-logistik-m-navigation-top-mobile));
        }
        :host > nav > .language-switcher {
          display: flex;
          flex-direction: row;
          justify-content: center;
        }
        :host > nav > .language-switcher > li {
          border: 0;
          width: auto;
        }
        :host > nav > ul > li > a-arrow{
          padding-bottom: 2px;
        }
        :host > nav > .language-switcher > li > a-arrow{
          display: none;
        }
        :host > nav > ul.open > li:not(.open), :host > nav > ul.open ~ ul.language-switcher {
          display: none;
        }
        :host > nav > ul > li{
          align-items: center;
          box-sizing: border-box;
          border-bottom: var(--header-border-bottom);
          display: flex;
          justify-content: space-between;
          width: 100%;
        }
        :host > nav > ul > li:hover:not(.search) {
          border-bottom: var(--header-border-bottom);
        }
        :host > nav > ul li.open {
          --a-link-content-spacing-no-scroll: var(--a-link-font-size-no-scroll-mobile) 1.2143rem var(--a-link-font-size-no-scroll-mobile) 0;
          --a-link-content-spacing: var(--a-link-content-spacing-no-scroll);
          --a-link-font-size-mobile: var(--a-link-font-size-no-scroll-mobile);
          --a-link-font-size-no-scroll-mobile: 1.7143rem;
          border-bottom: var(--header-border-bottom);
          flex-direction: row-reverse;
        }
        :host > nav > ul > li > div.background {
          display: none !important;
        }
        :host > nav > ul li a-link {
          display: flex;
          align-items: center;
        }
        :host > nav > ul li > ${this.getAttribute('o-nav-wrapper') || 'o-nav-wrapper'} > section {
          margin-top: calc(3rem + 1px);
          max-height: unset;
          padding: 0 0 2.5rem 0;
          z-index: 100;
        }
        :host > nav > ul li.open > ${this.getAttribute('o-nav-wrapper') || 'o-nav-wrapper'} > section {
          --a-link-content-spacing-no-scroll: 0.5rem 0.5rem 0.5rem calc(2rem + 50px);
          --a-link-content-spacing: var(--a-link-content-spacing-no-scroll);
          --a-link-font-size-mobile: 1.1429rem;
          --a-link-second-level-font-size-mobile: var(--a-link-font-size-mobile);
          animation: open .2s ease;
          left: 0;
        }
        :host > nav > ul li.open > ${this.getAttribute('o-nav-wrapper') || 'o-nav-wrapper'} > section > ul {
          --padding-mobile: 0.8571rem 0;
          --padding-first-child-mobile: var(--padding-mobile);
          --padding-last-child-mobile: var(--padding-mobile);
          border-bottom: var(--header-border-bottom);
        }
        :host > nav > ul li.open > ${this.getAttribute('o-nav-wrapper') || 'o-nav-wrapper'} > section > ul:last-child {
          margin-bottom: 100px !important; /* must be up, otherwise the iphone hides it behind the footer bar */
        }
        :host > nav > ul li.open > ${this.getAttribute('o-nav-wrapper') || 'o-nav-wrapper'} > section > ul > li:first-child, :host > nav > ul li.open > ${this.getAttribute('o-nav-wrapper') || 'o-nav-wrapper'} > section > ul > li.bold {
          --a-link-content-spacing-no-scroll: 0.5rem 0.5rem 0.5rem 50px;
          --a-link-content-spacing: var(--a-link-content-spacing-no-scroll);
          --a-link-font-size-mobile: 1.2857rem;
          --a-link-second-level-font-size-mobile: var(--a-link-font-size-mobile);
          padding-bottom: 0;
        }
        :host > nav > ul li.open > ${this.getAttribute('o-nav-wrapper') || 'o-nav-wrapper'} > section > ul > li {
          --line-height-mobile: 1.5em;
          line-height: 0;
          padding-bottom: 0;
        }
        :host > nav > ul li.open > ${this.getAttribute('o-nav-wrapper') || 'o-nav-wrapper'} > section > ul > li.bold {
          border-bottom: var(--header-border-bottom);
          padding: var(--padding-mobile);
        }
        :host > nav > ul li.open > ${this.getAttribute('o-nav-wrapper') || 'o-nav-wrapper'} > section > ul > li.bold:first-child {
          padding-top: 0;
        }
        :host > nav > ul li.open > ${this.getAttribute('o-nav-wrapper') || 'o-nav-wrapper'} > section > ul > li.bold:last-child {
          border-bottom: 0;
          padding-bottom: 0;
        }
        :host > nav > ul > li.search > * {
          width: 100%;
        }
        :host > nav > ul > li.search {
          margin-top: 0;
        }
      }
      @keyframes open {
        0% {left: -100vw}
        100% {left: 0}
      }
    `
  }

  /**
   * renders the a-link html
   *
   * @return {void}
   */
  renderHTML () {
    super.renderHTML(['left', 'right'])
    this.loadChildComponents().then(children => {
      Array.from(this.root.querySelectorAll('section')).forEach((section, i) => {
        const wrapper = new children[2][1]({ mode: 'false' })
        wrapper.setAttribute('id', `nav-section-${i}`)
        const sectionChildren = Array.from(section.children)
        sectionChildren.forEach((node, i) => {
          if (sectionChildren.length < 4) wrapper.setAttribute(`any-${i + 1}-width`, '25%')
          if (!node.getAttribute('slot')) wrapper.root.appendChild(node)
        })
        section.parentNode.prepend(this.getBackground())
        section.replaceWith(wrapper)
      })
      this.root.querySelectorAll('a-link').forEach(link => link.addEventListener('click', this.clickListener))
      this.root.querySelectorAll('nav > ul:not(.language-switcher) > li').forEach(link => link.addEventListener('click', this.liClickListener))
      this.html = this.style
    })
  }

  /**
   * fetch children when first needed
   *
   * @returns {Promise<[string, CustomElementConstructor][]>}
   */
  loadChildComponents () {
    if (this.childComponentsPromise) return this.childComponentsPromise
    let wrapperPromise
    try {
      wrapperPromise = Promise.resolve({ Wrapper: Wrapper })
    } catch (error) {
      wrapperPromise = import('../web-components-cms-template/src/es/components/organisms/Wrapper.js')
    }
    return super.loadChildComponents([
      wrapperPromise.then(
        /** @returns {[string, any]} */
        module => [this.getAttribute('o-nav-wrapper') || 'o-nav-wrapper', module.Wrapper(Shadow())]
      ).then(element => {
        if (!customElements.get(element[0])) customElements.define(element[0], element[1])
        return element
      })
    ])
  }

  getBackground () {
    const background = document.createElement('div')
    background.classList.add('background')
    return background
  }

  setFocusLostClickBehavior () {
    clearTimeout(this._focusLostClickBehaviorTimeout)
    this._focusLostClickBehaviorTimeout = setTimeout(() => {
      // the checkMedia is used to hack the click behavior of BaseNavigation to remove on desktop all li.open when  clicked away or in an other menu point. This because we need to indicate the active menu point with a border under the list
      if (this.checkMedia('desktop')) {
        this.setAttribute('focus-lost-close-mobile', '')
      } else {
        this.removeAttribute('focus-lost-close-mobile')
      }
    }, 50)
  }

  /**
   *
   *
   * @param {'mobile' | 'desktop'} [media=this.getAttribute('media')]
   * @returns {boolean}
   * @memberof IntersectionScrollEffect
   */
  checkMedia (media = this.getAttribute('media')) {
    // @ts-ignore ignoring self.Environment error
    const breakpoint = this.getAttribute('mobile-breakpoint') ? this.getAttribute('mobile-breakpoint') : self.Environment && !!self.Environment.mobileBreakpoint ? self.Environment.mobileBreakpoint : '1000px'
    const isMobile = self.matchMedia(`(max-width: ${breakpoint})`).matches
    return (isMobile ? 'mobile' : 'desktop') === media
  }

  get style () {
    return this._style || (this._style = (() => {
      const style = document.createElement('style')
      style.setAttribute('protected', 'true')
      return style
    })())
  }
}
