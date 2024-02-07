// @ts-check
import { Mutation } from '../../prototypes/Mutation.js'

/* global self */
/* global CustomEvent */

/**
 * Navigation hosts uls
 * Example at: /src/es/components/pages/Home.html
 * As a molecule, this component shall hold Atoms
 *
 * @export
 * @class NavigationTwo
 * @type {CustomElementConstructor}
 * @attribute {
 *  {boolean} [hover=false]
 *  {boolean} [focus-lost-close=false] tell it to close when focus is lost
 * }
 * @css {
 *  --content-spacing [40px]
 *  --a-link-content-spacing [0]
 *  --a-link-font-size [1rem]
 *  --background-color [black]
 *  --list-style [none]
 *  --align-items [start]
 *  --min-width [100px] of list items at second level
 *  --padding-top [6px] first list item at second level
 *  --hr-color [white]
 *  --a-link-font-size-mobile [2rem]
 *  --font-weight-mobile [normal]
 *  --a-link-text-align-mobile [center]
 *  --justify-content-mobile [center]
 *  --a-arrow-color-hover [--color-hover, white]
 *  --a-arrow-color [#777]
 *  --min-height-mobile [50px]
 *  --min-width-mobile [50px]
 * }
 */
export default class NavigationTwo extends Mutation() {
  constructor(options = {}, ...args) {
    super({
      importMetaUrl: import.meta.url,
      mutationObserverInit: { attributes: true, attributeFilter: ['aria-expanded'] },
      ...options
    }, ...args)

    this.isDesktop = this.checkMedia('desktop')
    this.useHoverListener = true


    // Done
    this.resizeListener = event => {
      if (this.hasAttribute('no-scroll')) {
        this.classList.remove(this.getAttribute('no-scroll') || 'no-scroll')
        this.nav.setAttribute('aria-expanded', this.getMedia() === 'desktop' ? 'true' : 'false')
      }

      // header removes no-scroll at body on resize, which must be avoided if navigation is open
      if (this.hasAttribute('no-scroll') && this.isDesktop === (this.isDesktop = this.checkMedia('desktop')) && ((!this.isDesktop && this.classList.contains('open')) || (this.isDesktop && this.root.querySelector('li.open')))) {
        this.dispatchEvent(new CustomEvent(this.getAttribute('no-scroll') || 'no-scroll', {
          detail: {
            hasNoScroll: true,
            origEvent: event,
            this: this
          },
          bubbles: true,
          cancelable: true,
          composed: true
        }))

        if (this.getMedia() !== 'desktop') this.nav.setAttribute('aria-expanded', 'true')
      }

      this.openClose(false)
    }

    // Done
    this.selfClickListener = () => {
      if (this.focusLostClose) {
        if (this.hasAttribute('focus-lost-close-mobile')) {
          // this.adjustArrowDirections(event, arrowDirections)
          if (this.hasAttribute('no-scroll')) {
            this.dispatchEvent(new CustomEvent(this.getAttribute('no-scroll') || 'no-scroll', {
              detail: {
                hasNoScroll: false,
                origEvent: event,
                this: this
              },
              bubbles: true,
              cancelable: true,
              composed: true
            }))
            if (this.getMedia() !== 'desktop') this.nav.setAttribute('aria-expanded', 'false')
          }
        }
      }
      this.openClose(false)
    }

    this.aLinkClickListener = event => {
      if (event.currentTarget) {
        if (!event.currentTarget.getAttribute('href') || event.currentTarget.getAttribute('href') === '#') {
          const isOpen = event.currentTarget.classList.contains('open')
          event.preventDefault()
          if (this.focusLostClose) {
            event.stopPropagation()
            if (this.hasAttribute('focus-lost-close-mobile') && this.hasAttribute('no-scroll')) {
              this.dispatchEvent(new CustomEvent(this.getAttribute('no-scroll') || 'no-scroll', {
                detail: {
                  hasNoScroll: true,
                  origEvent: event,
                  this: this
                },
                bubbles: true,
                cancelable: true,
                composed: true
              }))
            }
          }

          if (this.isDesktop && this.useHoverListener) { }
          if (this.isDesktop && !this.useHoverListener) { }
          if (event.currentTarget.parentNode && event.currentTarget.parentNode.parentNode && event.currentTarget.parentNode.parentNode.tagName === 'UL') {
            event.currentTarget.parentNode.parentNode.classList[isOpen ? 'remove' : 'add']('open')
          }

          // remove all the previous open class by other a tag
          Array.from(event.currentTarget.parentNode.parentNode.querySelectorAll('a')).forEach(a => {
            a.classList.remove('open')
          })
          // remove all the previous open class by other li tag
          Array.from(event.currentTarget.parentNode.parentNode.querySelectorAll('li')).forEach(li => {
            li.classList.remove('open')
          })
          event.currentTarget.classList[isOpen ? 'remove' : 'add']('open')
          event.currentTarget.parentNode.classList[isOpen ? 'remove' : 'add']('open')

        } else if (event.currentTarget.getAttribute('href').includes('#')) {
          // TODO Silvan => why it doesnt work innerLink
          this.dispatchEvent(new CustomEvent(this.getAttribute('click-anchor') || 'click-anchor', {
            detail: {
              selector: event.currentTarget.getAttribute('href')
            },
            bubbles: true,
            cancelable: true,
            composed: true
          }))
        } else if (event.currentTarget.getAttribute('href')) {
          // TODO Ivan keep open or close?
          event.preventDefault()
          // immediately hide the navigation when navigating to new page and in case the self.open would fail, for what ever reason, reset the style attribute
          if (this.getMedia() !== 'desktop') this.setAttribute('style', 'display: none;')
          setTimeout(() => this.removeAttribute('style'), 3000)
          self.open(event.currentTarget.getAttribute('href'), event.currentTarget.getAttribute('target') || '_self')
        }

      }
    }

    this.subLiHoverListener = (event) => {
      event.target.parentElement.querySelectorAll("li").forEach(li => li.classList.remove("hover-active"))
      const currentNavLevel = + event.target.parentElement.parentElement.getAttribute("nav-level")
      const nextNavLevel = currentNavLevel + 1
      const secondNextNavLevel = currentNavLevel + 2
      const childSubNavName = event.target.getAttribute("sub-nav")
      const directSubWrapper = Array.from(event.currentTarget.currentWrapper.querySelectorAll("div[nav-level]")).filter(div => +div.getAttribute("nav-level") === nextNavLevel)
      const secondSubWrapper = Array.from(event.currentTarget.currentWrapper.querySelectorAll("div[nav-level]")).filter(div => +div.getAttribute("nav-level") === secondNextNavLevel)
      const allSubWrappers = Array.from(event.currentTarget.currentWrapper.querySelectorAll("div[nav-level]")).filter(div => +div.getAttribute("nav-level") > currentNavLevel)

      if (!event.target.classList.contains("hover-active")) {
        event.target.classList.add("hover-active")
      }

      if (!event.target.hasAttribute("sub-nav")) {
        allSubWrappers.forEach(wrapper => {
          Array.from(wrapper.querySelectorAll("ul")).forEach(ul => {
            Array.from(ul.querySelectorAll("li")).forEach(li => li.classList.remove("hover-active"))
            ul.scrollTo(0, 0)
            ul.style.display = "none";
            ul.parentElement.hidden = true
          })
        })
      }

      if (event.target.hasAttribute("sub-nav")) {

        if (allSubWrappers.length) {
          allSubWrappers.forEach(wrapper => {
            let activeLiElements = Array.from(wrapper.querySelectorAll(".hover-active"));
            let allLiElements = Array.from(wrapper.querySelectorAll("li"));
            activeLiElements.forEach(li => {
              if (li.parentElement.getAttribute("sub-nav-id") !== event.target.getAttribute("sub-nav")) {
                li.parentElement.scrollTo(0, 0)
              }
              li.parentElement.parentElement.hidden = true
              li.parentElement.style.display = "none"
            })
            allLiElements.forEach(li => li.classList.remove("hover-active"))
          })
        }

        if (directSubWrapper.length) {
          directSubWrapper.forEach(wrapper => {
            Array.from(wrapper.querySelectorAll("ul")).forEach(ul => {
              if (ul.getAttribute("sub-nav-id") === childSubNavName) {
                ul.parentElement.hidden = false
                ul.style.display = "block"
              } else {
                ul.scrollTo(0, 0)
                ul.style.display = "none"
              }
            })
          })
        }

        if (secondSubWrapper.length) {
          secondSubWrapper.forEach(wrapper => {
            if (Array.from(wrapper.querySelectorAll(".hover-active"))) {
              Array.from(wrapper.querySelectorAll("ul")).forEach(ul => {
                ul.scrollTo(0, 0)
                ul.style.display = "none"
                ul.parentElement.hidden = true
              })
            }
          })
        }
      }
    }
  }

  connectedCallback() {
    this.hidden = true
    const showPromises = []
    if (this.shouldRenderCSS()) showPromises.push(this.renderCSS())
    if (this.shouldRenderHTML()) showPromises.push(this.renderHTML())
    Promise.all(showPromises).then(() => {
      this.hidden = false
      this.setFocusLostClickBehavior()
      this.dispatchEvent(new CustomEvent(this.getAttribute('navigation-load') || 'navigation-load', {
        detail: {
          child: this
        },
        bubbles: true,
        cancelable: true,
        composed: true
      }))
    })
    self.addEventListener('resize', this.resizeListener)
    self.addEventListener('click', this.selfClickListener)
    this.addCustomColors()
    super.connectedCallback()
  }

  disconnectedCallback() {
    self.removeEventListener('resize', this.resizeListener)
    self.removeEventListener('click', this.selfClickListener)
    Array.from(this.root.querySelectorAll('a')).forEach(a => a.removeEventListener('click', this.aLinkClickListener))
    super.disconnectedCallback()
  }

  /**
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldRenderCSS() {
    return !this.root.querySelector(`:host > style[_css], ${this.tagName} > style[_css]`)
  }

  /**
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldRenderHTML() {
    return !this.nav
  }

  /**
   * renders the m-navigation-two css
   *
   * @return {Promise<void>|void}
   */
  renderCSS() {
    const firstLevelCount = this.root.querySelectorAll('nav > ul > li').length
    this.css = /* css */`
    :host > nav > ul {
      align-items: var(--align-items, normal);
      justify-content: var(--justify-content, normal);
      display: flex;
      flex-wrap: var(--flex-wrap, nowrap);
      flex-direction: var(--flex-direction, row);
      padding: var(--padding, calc(var(--content-spacing, 40px) / 2) 0);
      position: relative;
      margin: 0;
      --navigation-klubschule-a-color: var(--color);
    }
    :host(.${this.getAttribute('no-scroll') || 'no-scroll'}) ul {
      background-color: var(--background-color-${this.getAttribute('no-scroll') || 'no-scroll'}, var(--background-color, black));
    }
    :host(.${this.getAttribute('no-scroll') || 'no-scroll'}) > nav > ul {
      padding: var(--padding-${this.getAttribute('no-scroll') || 'no-scroll'}, calc(var(--content-spacing, 40px) / 2) 0);
    }
    :host li ks-m-nav-level-item {
      --nav-level-item-default-font-size: 1em;
      --nav-level-item-default-font-weight: 500;
    }
    :host li.hover-active ks-m-nav-level-item {
      --nav-level-item-default-background-color: #E0F0FF;
    }
    :host > nav > ul > li {
      display: block;
      padding: var(--li-padding, 0 calc(var(--content-spacing, 40px) / 4));
    }
    :host > nav > ul > li > o-nav-wrapper a {
      --a-color: var(--color-active);
    }
    :host > nav > ul > li > a.open > span {
      border-bottom: 3px solid var(--color-active);
      color: var(--color-active);
    }
    :host > nav > ul > li > a:hover,
    :host > nav > ul > li > a:active,
    :host > nav > ul > li > a:focus {
      color: var(--color-active);
    }
    :host > nav > ul > li > a > span {
      padding: 0 0 0.5em 0;
    }
    :host > nav > ul > li > a:hover > span {
      border-bottom: 3px solid var(--color-active);
    }
    :host > nav > ul > li > o-nav-wrapper {
      display: none !important;
      position: absolute;
      top: 2em;
      left: calc(0 - var(--logo-default-width,var(--width, auto)));
      right: 0;
      background-color: white;
      width: calc(100% + var(--logo-default-width,var(--width, auto)));
      border-top: 1px solid #E0E0E0;
      --any-1-width: 33%;
      --justify-content: start;
      --align-items: start;
      --ul-padding-left: 0;
      --show: slideInFromTop 0.2s ease;
      max-height: var(--main-wrapper-max-height, 70vh);
      overflow: hidden;
    }
    :host > nav > ul > li.open > o-nav-wrapper {
      display: flex !important;
    }
    :host > nav > ul > li > o-nav-wrapper > section {
      --gap: 1.25em;
     padding: 1.5em 0;
    }
    :host > nav > ul > li > o-nav-wrapper > section > div {
      max-width: 33.5%;
      position: relative;
    }
    :host > nav > ul > li > o-nav-wrapper > section > div::after {
      content: "";
      display: block;
      position: absolute;
      top: 4px;
      right: -0.5em;
      height: 100%;
      width: 1px;
      background: #E0E0E0;
    }
    :host > nav > ul > li > o-nav-wrapper > section > div > ul {
      max-height: calc(var(--main-wrapper-max-height) - 5vh);
      overflow-y: auto;
      overflow-x: visible;
      position: relative;
    }
    :host > nav > ul > li > o-nav-wrapper > section > div > ul::-webkit-scrollbar {
      width: 5px;
      background-color: #E0E0E0;
      margin: 0.5em;
    }
    :host > nav > ul > li > o-nav-wrapper > section > div > ul::-webkit-scrollbar-thumb {
      background: #535353;
    }
    :host > nav > ul > li > o-nav-wrapper > section > div > ul > li.list-title {
      padding: 1em;
      --ul-li-padding-left: 0.75em;
      --a-font-weight: 500;
      --a-font-size: 1.15em;
      --a-color-hover: var(--color-active);
    }
    :host > nav > ul > li > o-nav-wrapper > section > div > ul > li.list-title > a > span {
      font-size: 0.7em !important;
      color: var(--color) !important;
      font-weight: 300 !important;
      padding-left: 0.25em;
    }
    :host > nav > ul > li > o-nav-wrapper > section > div > ul > li.list-title > a:hover > span {
      text-decoration: underline;
      color: var(--color-active) !important;

    }
    /* FROM HERE THE PASTED CSS*/
    :host {
      color: black;
      overscroll-behavior: contain;
    }
    :host > nav > ul > li > a {
      padding: var(--a-main-content-spacing, 14px 10px);
      font-size: var(--a-main-font-size, 1rem);
      font-weight: var(--a-main-font-weight);
      line-height: var(--a-main-line-height);
      text-transform: var(--a-main-text-transform);
      font-family: var(--a-main-font-family, var(--font-family));
      font-weight: var(--a-font-weight, var(--font-weight, normal));
    }
    :host(.${this.getAttribute('no-scroll') || 'no-scroll'}) a {
      --color: var(--a-color-${this.getAttribute('no-scroll') || 'no-scroll'});
      --padding: var(--a-content-spacing-${this.getAttribute('no-scroll') || 'no-scroll'}, 14px 10px);
      --font-size: var(--a-font-size-${this.getAttribute('no-scroll') || 'no-scroll'}, 1rem);
      --font-weight: var(--a-font-weight-${this.getAttribute('no-scroll') || 'no-scroll'});
      --line-height: var(--a-line-height-${this.getAttribute('no-scroll') || 'no-scroll'});
    }
    :host > nav > ul li.open > ${this.getAttribute('o-nav-wrapper') || 'o-nav-wrapper'} > section {
      --a-link-content-spacing-no-scroll: var(--a-link-content-spacing-no-scroll-custom, 0.5rem 0.5rem 0.5rem calc(2rem + min(30vw, 50px)));
      --a-link-content-spacing: var(--a-link-content-spacing-no-scroll);
      --a-link-font-size-mobile: 1.1429rem;
      --a-link-second-level-font-size-mobile: var(--a-link-font-size-mobile);
      animation: open .2s ease;
      left: 0;
    }
    @keyframes slideInFromTop {
      0% {
        opacity: 0;
        transform: translateY(-5em)
      }
      100% {
        opacity: 1;
        transform: translateY(0)
        }
      }
    }
    `
    return this.fetchTemplate()
  }

  /**
   * fetches the template
   *
   * @return {Promise<void>}
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
      case 'navigation-klubschule-':
        return this.fetchCSS([{
          path: `${this.importMetaUrl}./default-/default-.css`, // apply namespace since it is specific and no fallback
          namespace: false,
          replaces: [{
            pattern: '--navigation-default-',
            flags: 'g',
            replacement: '--navigation-klubschule-'
          }]
        }, {
          path: `${this.importMetaUrl}./klubschule-/klubschule-.css`, // apply namespace since it is specific and no fallback
          namespace: false
        }, ...styles], false)
      default:
        return Promise.resolve()
    }
  }

  /**
   * renders the a-link html
   *
   * @return {Promise<void>}
   */
  renderHTML() {
    this.nav = this.root.querySelector('nav') || document.createElement('nav')
    this.nav.setAttribute('aria-labelledby', 'hamburger')
    this.nav.setAttribute('aria-expanded', this.getMedia() === 'desktop' ? 'true' : 'false')
    Array.from(this.root.children).forEach(node => {
      if (node.getAttribute('slot') || node.nodeName === 'STYLE' || node.tagName === 'NAV') return false
      this.nav.appendChild(node)
    })
    this.html = this.nav
    return this.fetchModules([
      {
        path: `${this.importMetaUrl}'../../../../organisms/wrapper/Wrapper.js`,
        name: this.getAttribute('o-nav-wrapper') || 'o-nav-wrapper'
      }
    ]).then(children => {
      Array.from(this.root.querySelectorAll('a')).forEach(a => a.addEventListener('click', this.aLinkClickListener))
      Array.from(this.root.querySelectorAll('section')).forEach((section, i) => {
        const wrapper = new children[0].constructorClass({ mode: 'false', mobileBreakpoint: this.mobileBreakpoint })
        // eslint-disable-line
        wrapper.setAttribute('id', `nav-section-${i}`)
        const sectionChildren = Array.from(section.children)
        sectionChildren.forEach((node) => {
          if (!node.getAttribute('slot')) wrapper.root.appendChild(node)
        })
        section.replaceWith(wrapper)

        Array.from(wrapper.querySelectorAll("div")).forEach(div => {
          if (+div.getAttribute("nav-level") !== 1) {
            Array.from(div.querySelectorAll("ul")).forEach(ul => {
              ul.style.display = "none";
            })
            div.hidden = true
          }
        })
        // Add class for title li a element
        let subTitleLiTags = Array.from(wrapper.querySelectorAll("li")).filter(li => !li.querySelector("ks-m-nav-level-item"))
        subTitleLiTags.forEach(li => li.classList.add("list-title"))

        // Add listener if there is an attribute on this element
        let subLiElements = Array.from(wrapper.querySelectorAll("li")).filter(li => li.querySelector("ks-m-nav-level-item"))
        if (this.isDesktop && this.useHoverListener) {
          subLiElements.forEach(li => {
            li.addEventListener("mouseenter", this.subLiHoverListener)
            li.currentWrapper = wrapper
          })
        }
      })
      this.html = this.style
    })
  }

  get focusLostClose() {
    return this.hasAttribute('focus-lost-close') && this.getAttribute('focus-lost-close') !== 'false'
  }

  setFocusLostClickBehavior() {
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

  openClose(open = true) {
    // mobile has an extra height: calc(100% + 300px) url workaround, but scroll back when closed
    if (!open && this.getMedia() !== 'desktop') {
      this.scroll({
        top: 0,
        behavior: 'smooth'
      })
    }
    if (!open && this.nav.getAttribute('aria-expanded') === 'true') {
      const firstLevelUl = this.root.querySelector("[nav-level='1'] > ul")
      if (firstLevelUl) firstLevelUl.scrollTo(0, 0)

      // We should refactor, too much forEach does the same thing
      Array.from(this.root.querySelectorAll("ul[style='display: block;']")).forEach(ul => {
        ul.scrollTo(0, 0)
        ul.style.display = "none"
      })
      Array.from(this.root.querySelectorAll('li.open')).forEach(link => {
        link.classList.remove('open')
        link.setAttribute('aria-expanded', 'false')
        if (link.parentElement) {
          link.parentElement.classList.remove('open')
          link.parentElement.setAttribute('aria-expanded', 'false')
        }
      })
      Array.from(this.root.querySelectorAll('a.open')).forEach(a => {
        a.classList.remove('open')
        if (a.parentElement) a.parentElement.classList.remove('open')
      })
      Array.from(this.root.querySelectorAll('li.hover-active')).forEach(li => {
        li.classList.remove('hover-active')
      })
      Array.from(this.root.querySelectorAll("ul[style='display: block;']")).forEach(ul => {
        ul.style.display = "none"
      })
      Array.from(this.root.querySelectorAll('ul.open')).forEach(ul => {
        ul.classList.remove('open')
      })
    }
  }

  /**
   *
   *
   * @param {'mobile' | 'desktop'} [media=this.getAttribute('media')]
   * @returns {boolean}
   * @memberof IntersectionScrollEffect
   */
  checkMedia(media = this.getAttribute('media')) {
    const isMobile = self.matchMedia(`(max-width: ${this.mobileBreakpoint})`).matches
    return (isMobile ? 'mobile' : 'desktop') === media
  }

  get style() {
    return this._style || (this._style = (() => {
      const style = document.createElement('style')
      style.setAttribute('protected', 'true')
      return style
    })())
  }

  addCustomColors() {
    Array.from(this.root.querySelectorAll("li")).forEach(li => {
      if (li.hasAttribute("main-color")) {
        li.style.setProperty("--navigation-klubschule-color-active", li.getAttribute("main-color"))
      }
    })
  }

  getMedia() {
    return self.matchMedia(`(min-width: calc(${this.mobileBreakpoint} + 1px))`).matches ? 'desktop' : 'mobile'
  }
}
