// @ts-check
import { Shadow } from '../../prototypes/Shadow.js'

/* global self */
/* global CustomEvent */

/**
 * Navigation hosts uls
 * Example at: /src/es/components/pages/Home.html
 * As a molecule, this component shall hold Atoms
 *
 * @export
 * @class MultiLevelNavigation
 * @type {CustomElementConstructor}
 * @attribute {
 *  {boolean} [hover=false]
 *  {boolean} [use-hover-listener=false] use hover listener on navigation // if false it uses click listener
 *  {string} [main-nav-title] Main navigation heading text for screen readers (default: "Main Navigation")
 *  {string} [sub-nav-title] Sub-navigation base text (default: "Sub Navigation")
 *  {string} [sub-nav-suffix] Suffix for sub-navigation titles (default: "- Sub Navigation") 
 *  {string} [mobile-nav-title] Mobile navigation base text (default: falls back to sub-nav-title)
 *  {string} [level-text] Text for level numbering (default: "Level")
 * }
 * 
 * Features:
 * - Hierarchical headings (h1-h6) for screen reader navigation
 * - ARIA attributes including aria-current="page" for current page indication
 * - Keyboard navigation support
 * - Multilingual text support through attributes
 * - WCAG 2.2 AA compliance
 */
export default class MultiLevelNavigation extends Shadow() {
  static get observedAttributes () {
    return ['aria-expanded']
  }

  constructor (options = {}, ...args) {
    super({
      importMetaUrl: import.meta.url,
      tabindex: 'no-tabindex',
      ...options
    }, ...args)
    this.noScroll = () => { window.scroll(0, 0) }
    this.isDesktop = this.checkMedia('desktop')
    this.useHoverListener = this.hasAttribute('use-hover-listener')
    this.animationDurationMs = this.getAttribute('animation-duration') || 300
    this.removeElementAfterAnimationDurationMs = this.animationDurationMs + 50
    this.desktopHeightBreakpoint = 800
    this.isHigherDevice = window.innerHeight > this.desktopHeightBreakpoint
    this.hoverDelay = this.hasAttribute('navigation-hover-delay') || 100
    this.focusElSelector = 'm-nav-level-item,a:not(:has(> m-nav-level-item)):not(.navigation-back)'

    this.hideMobileNavigation()

    this.resizeListener = event => {
      const oldIsDesktopValue = this.isDesktop
      const oldAriaExpandedAttribute = this.nav.getAttribute('aria-expanded')

      if (this.hasAttribute('no-scroll')) this.classList.remove(this.getAttribute('no-scroll') || 'no-scroll')

      // header removes no-scroll at body on resize, which must be avoided if navigation is open
      if (this.hasAttribute('no-scroll') && this.isDesktop === (this.isDesktop = this.checkMedia('desktop')) && ((this.isDesktop && this.classList.contains('open')) || (this.isDesktop && this.root.querySelector('li.open')))) {
        this.nav.setAttribute('aria-expanded', 'false')
        this.setScrollOnBody(!this.classList.contains('open'), event)
      }

      // by mobile resize it closes the open flyout nav, clears the flyout state and set the scroll available on the body
      if (!this.isDesktop) {
        if (this.getRootNode().host?.shadowRoot?.querySelector('header')?.classList.contains('open')) {
          this.getRootNode().host.shadowRoot.querySelector('a-menu-icon').click()
          this.setScrollOnBody(true, event)
        }
        this.hideAndClearMobileSubNavigation()
      }

      // clear desktop flyout state (hover, scrollPosition, etc) if closes
      if (this.isDesktop && (oldAriaExpandedAttribute !== this.nav.getAttribute('aria-expanded') || oldIsDesktopValue !== this.isDesktop)) this.hideAndClearDesktopSubNavigation()

      // make some change on html to be mobile or desktop layout compatible if the screen-width changes between mobile and desktop
      if (oldIsDesktopValue !== this.isDesktop) this.htmlReBuilderByLayoutChange()

      // update navigation hight if the window-height changes
      if (this.isHigherDevice !== (window.innerHeight > this.desktopHeightBreakpoint)) {
        this.recalculateNavigationHeight()
        this.isHigherDevice = window.innerHeight > this.desktopHeightBreakpoint
      }
      // update main navigation lis font-size
      this.setMainNavigationFontSize()
      this.hideMobileNavigation()
    }

    this.selfClickListener = (event) => {
      const currentAriaExpandedAttribute = this.nav.getAttribute('aria-expanded') === 'true'
      if (this.isDesktop) this.nav.setAttribute('aria-expanded', 'false')
      if (this.isDesktop && this.hasAttribute('no-scroll')) this.setScrollOnBody(false, event)
      if (this.isDesktop && currentAriaExpandedAttribute) this.hideAndClearDesktopSubNavigation(event)
      if (this.isDesktop) {
        setTimeout(() => {
          this.setActiveNavigationItemBasedOnUrl()
        }, 150)
      }
      if (!this.isDesktop) {
        if (this.openAnimationDelayNeeded) {
          this.openAnimationDelayNeeded = false
          setTimeout(() => {
            this.hideAndClearMobileSubNavigation()
          }, 200)
        } else {
          this.openAnimationDelayNeeded = false
          this.hideAndClearMobileSubNavigation()
        }
      }
    }

    this.aLinkClickListener = event => {
      if (event.currentTarget) {
        // aria-current
        const href = event.currentTarget.getAttribute('href')
        if (href && href !== '#' && !href.includes('javascript:')) this.setAriaCurrent(event.currentTarget)
        
        // If desktop and use-hover-listener attribute exists
        if (this.isDesktop && this.useHoverListener) {
          if (!event.currentTarget.getAttribute('href') || event.currentTarget.getAttribute('href') === '#') this.setDesktopMainNavItems(event)
          else if (event.currentTarget.getAttribute('href').includes('#')) this.handleAnchorClickOnNavItems(event)
          else if (event.currentTarget.getAttribute('href')) this.handleNewTabNavigationOnNavItems(event)
        } else if (this.isDesktop && !this.useHoverListener) {
          // If desktop and use-hover-listener attribute NOT exists
          if (!event.currentTarget.getAttribute('href') || event.currentTarget.getAttribute('href') === '#') {
            this.setDesktopMainNavItems(event)
            // Click event logic
            if (event.currentTarget.parentNode.hasAttribute('sub-nav')) this.handleOnClickOnDesktopSubNavItems(event)
          } else if (event.currentTarget.getAttribute('href').includes('#')) this.handleAnchorClickOnNavItems(event)
          else if (event.currentTarget.getAttribute('href')) this.handleNewTabNavigationOnNavItems(event)
        } else {
          // if mobile
          if (!event.currentTarget.getAttribute('href') || event.currentTarget.getAttribute('href') === '#') {
            event.preventDefault()
            event.stopPropagation()
            // set aria expanded attributes
            const allSubNavLinks = Array.from(event.currentTarget.parentNode.parentNode.parentNode.querySelectorAll('li')).filter(li => li.hasAttribute('sub-nav'))
            allSubNavLinks.forEach(link => link.setAttribute('aria-expanded', 'false'))
            if (event.currentTarget.parentNode?.parentNode?.parentNode?.tagName === 'NAV') this.setMobileMainNavItems(event)
            if (event.currentTarget.parentNode.hasAttribute('sub-nav')) this.handleOnClickOnMobileSubNavItems(event)
          } else if (event.currentTarget.getAttribute('href').includes('#')) this.handleAnchorClickOnNavItems(event)
          else if (event.currentTarget.getAttribute('href')) this.handleNewTabNavigationOnNavItems(event)
        }
      }
    }

    this.aMainLinkHoverListener = event => {
      if (event.currentTarget) {
        let template
        if ((template = event.currentTarget.parentElement.querySelector('li > template'))) {
          this.setLoadCustomElementsAttribute(template)
          this.fetchModules([
            {
              path: `${this.importMetaUrl}'../../../../organisms/wrapper/Wrapper.js`,
              name: this.getAttribute('o-nav-wrapper') || 'o-nav-wrapper'
            }
          ]).then(children => {
            Array.from(template.content.querySelectorAll('section')).forEach((section, i) => {
              const wrapper = new children[0].constructorClass({ mode: 'false', mobileBreakpoint: this.mobileBreakpoint })
              // eslint-disable - line
              wrapper.setAttribute('id', `nav-section-${i}`)
              const sectionChildren = Array.from(section.children)
              sectionChildren.forEach((node) => {
                if (!node.getAttribute('slot')) {
                  if (+node.getAttribute('nav-level') === 1) node.querySelector('ul').setAttribute('id', 'nav-level-1')
                  wrapper.root.appendChild(node)
                }
              })
              template.replaceWith(wrapper)
              // add main background color dark if flyout open div
              const mainBackgroundDiv = document.createElement('div')
              mainBackgroundDiv.className = 'main-background'
              wrapper.parentElement?.prepend(mainBackgroundDiv)

              // add full width background with div
              const wrapperBackgroundDiv = document.createElement('div')
              wrapperBackgroundDiv.className = 'wrapper-background'
              wrapper.prepend(wrapperBackgroundDiv)
              
              // update a11y headings after content is loaded
              setTimeout(() => { this.addSubNavigationHeadings() }, 50)

              // add close icon to all flyout
              const closeIconElement = document.createElement('a')
              closeIconElement.innerHTML = /* HTML */`
         <a-icon-mdx namespace='icon-link-list-' icon-name='X' size='1.5em' rotate='0' class='icon-right' role="${this.getAttribute('close-nav-role') || 'Close navigation'}"></a-icon-mdx>
         `
              closeIconElement.classList.add('close-icon')
              closeIconElement.setAttribute('tabindex', '0')
              wrapper.querySelector('section')?.appendChild(closeIconElement)

              // Add class for title li a element
              const subTitleLiTags = Array.from(wrapper.querySelectorAll('li')).filter(li => !li.querySelector('m-nav-level-item'))
              subTitleLiTags.forEach(li => {
                li.classList.add('list-title')
                li.childNodes[0].nextElementSibling && li.childNodes[0].nextElementSibling.firstChild
                  ? li.childNodes[0].nextElementSibling.firstChild.textContent = li.childNodes[0].nextElementSibling.firstChild.textContent.trim()
                  : null
              }
              )

              // add subUl id based on sub-nav-id to have aria-controls connection
              const subUlElements = Array.from(wrapper.querySelectorAll('ul')).filter(ul => ul.hasAttribute('sub-nav-id'))
              subUlElements.forEach(ul => ul.setAttribute('id', `${ul.getAttribute('sub-nav-id')}`))

              // Add listener if there is an attribute on this element
              const subLiElements = Array.from(wrapper.querySelectorAll('li')).filter(li => li.querySelector('m-nav-level-item'))
              subLiElements.forEach(li => {
                // set aria attributes where needed
                if (li.hasAttribute('sub-nav')) {
                  // avoid closing navigation if user clicks on subLi element which has subNavigation
                  li.addEventListener('click', (event) => event.stopPropagation())
                  li.setAttribute('aria-expanded', 'false')
                  li.setAttribute('aria-controls', `${li.getAttribute('sub-nav')}`)
                }
                // add hover listener when needed
                if (this.useHoverListener) {
                  li.addEventListener('mouseenter', this.subLiHoverListener)
                  li.currentWrapper = wrapper
                }
              })
            })
          })
        }
      }
    }

    this.subLiHoverListener = (event) => {
      clearTimeout(this.subLiHoverTimeout)
      const target = Array.from(event.composedPath()).find(node => node.tagName === 'LI')
      this.subLiHoverTimeout = setTimeout(() => {
        target.parentElement.querySelectorAll('li').forEach(li => {
          li.classList.remove('hover-active')
          li.setAttribute('aria-expanded', 'false')
        })
        const currentNavLevel = +target.parentElement.parentElement.getAttribute('nav-level')
        const nextNavLevel = currentNavLevel + 1
        const secondNextNavLevel = currentNavLevel + 2
        const childSubNavName = target.getAttribute('sub-nav')
        const directSubWrapper = Array.from(target.currentWrapper.querySelectorAll('div[nav-level]')).filter(div => +div.getAttribute('nav-level') === nextNavLevel)
        const secondSubWrapper = Array.from(target.currentWrapper.querySelectorAll('div[nav-level]')).filter(div => +div.getAttribute('nav-level') === secondNextNavLevel)
        const allSubWrappers = Array.from(target.currentWrapper.querySelectorAll('div[nav-level]')).filter(div => +div.getAttribute('nav-level') > currentNavLevel)

        if (!target.classList.contains('hover-active')) {
          target.classList.add('hover-active')
          target.setAttribute('aria-expanded', 'true')
          const link = target.querySelector('a[aria-haspopup]')
          if (link) link.setAttribute('aria-expanded', 'true')
          const currentEventTarget = target
          if (target && !target.hasAttribute('sub-nav') && target.classList.contains('hover-active')) {
            setTimeout(() => {
              currentEventTarget.classList.remove('hover-active')
              currentEventTarget.setAttribute('aria-expanded', 'false')
              const link = currentEventTarget.querySelector('a[aria-haspopup]')
              if (link) link.setAttribute('aria-expanded', 'false')
            }, 2000)
          }
        }

        if (!target.hasAttribute('sub-nav')) {
          allSubWrappers.forEach(wrapper => {
            Array.from(wrapper.querySelectorAll('ul')).forEach(ul => {
              Array.from(ul.querySelectorAll('li')).forEach(li => {
                li.classList.remove('hover-active')
                li.setAttribute('aria-expanded', 'false')
                const link = li.querySelector('a[aria-haspopup]')
                if (link) link.setAttribute('aria-expanded', 'false')
              })
              ul.scrollTo(0, 0)
              ul.style.display = 'none'
              ul.parentElement.hidden = true
            })
          })
        }

        if (target.hasAttribute('sub-nav')) {
          if (allSubWrappers.length) {
            allSubWrappers.forEach(wrapper => {
              const activeLiElements = Array.from(wrapper.querySelectorAll('.hover-active'))
              const allLiElements = Array.from(wrapper.querySelectorAll('li'))
              activeLiElements.forEach(li => {
                if (li.parentElement.getAttribute('sub-nav-id') !== target.getAttribute('sub-nav')) {
                  li.parentElement.scrollTo(0, 0)
                }
                li.parentElement.parentElement.hidden = true
                li.parentElement.style.display = 'none'
              })
              allLiElements.forEach(li => {
                li.classList.remove('hover-active')
                li.setAttribute('aria-expanded', 'false')
              })
            })
          }

          if (directSubWrapper.length) {
            directSubWrapper.forEach(wrapper => {
              Array.from(wrapper.querySelectorAll('ul')).forEach(ul => {
                if (ul.getAttribute('sub-nav-id') === childSubNavName) {
                  ul.parentElement.hidden = false
                  ul.style.display = 'block'
                  ul.querySelector(this.focusElSelector)?.focus()
                } else {
                  ul.scrollTo(0, 0)
                  ul.style.display = 'none'
                }
              })
            })
          }

          if (secondSubWrapper.length) {
            secondSubWrapper.forEach(wrapper => {
              if (Array.from(wrapper.querySelectorAll('.hover-active'))) {
                Array.from(wrapper.querySelectorAll('ul')).forEach(ul => {
                  ul.scrollTo(0, 0)
                  ul.style.display = 'none'
                  ul.parentElement.hidden = true
                })
              }
            })
          }
        }
      }, this.hoverDelay)
    }

    this.closeEventListener = event => {
      const currentAriaExpandedAttribute = this.nav.getAttribute('aria-expanded') === 'true'
      if (this.isDesktop && event.composedPath()[0].tagName !== 'M-MULTI-LEVEL-NAVIGATION') this.nav.setAttribute('aria-expanded', 'false')
      if (this.isDesktop && currentAriaExpandedAttribute) this.hideAndClearDesktopSubNavigation(event)
      if (!this.isDesktop && this.getRootNode().host?.shadowRoot?.querySelector('header')?.classList.contains('open')) {
        this.getRootNode().host.shadowRoot.querySelector('a-menu-icon').click()
        this.setScrollOnBody(true, event)
        this.hideAndClearMobileSubNavigation()
      }
    }

    // accessibility
    this.enterEventListener = event => {
      if (event.code === 'Enter' && event.composedPath()[0].matches(':focus')) event.composedPath()[0].click()
    }
  }

  connectedCallback () {
    this.hidden = true
    const showPromises = []
    if (this.shouldRenderCSS()) showPromises.push(this.renderCSS())
    if (this.shouldRenderHTML()) showPromises.push(this.renderHTML())
    Promise.all(showPromises).then(() => {
      this.hidden = false
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
    this.addEventListener('keyup', this.enterEventListener)
    if (this.getAttribute('close-event-name')) document.body.addEventListener(this.getAttribute('close-event-name'), this.closeEventListener)
    this.addCustomColors()
    this.isCheckout = this.parentElement.getAttribute('is-checkout') === 'true'
    if (this.isCheckout) this.root.querySelector('nav').style.display = 'none'
    this.root.querySelectorAll("a-input[prevent-default-input-search='true']").forEach(input => input.addEventListener('blur', this.noScroll))
    this.recalculateNavigationHeight()
    this.setActiveNavigationItemBasedOnUrl()
    this.setMainNavigationFontSize()
    this.initAriaCurrentMonitoring()
    setTimeout(() => {
      this.addNavigationHeadings()
      this.addAriaHiddenToDecorativeElements()
      this.addScreenReaderLabels()
    }, 100)
    setTimeout(() => {
      this.addAriaHiddenToDecorativeElements()
    }, 300)
    this.addAriaHiddenToDecorativeElements()
    super.connectedCallback()
  }

  disconnectedCallback () {
    self.removeEventListener('resize', this.resizeListener)
    self.removeEventListener('click', this.selfClickListener)
    this.removeEventListener('keyup', this.enterEventListener)
    if (this.getAttribute('close-event-name')) document.body.removeEventListener(this.getAttribute('close-event-name'), this.closeEventListener)
    Array.from(this.root.querySelectorAll('a')).forEach(a => {
      a.removeEventListener('click', this.aLinkClickListener)
      a.removeEventListener('click', this.aMainLinkHoverListener)
    })
    this.root.querySelectorAll("a-input[prevent-default-input-search='true']").forEach(input => input.removeEventListener('blur', this.noScroll))
    if (this.ariaCurrentObserver) this.ariaCurrentObserver.disconnect()
    if (this.ariaHiddenObserver) this.ariaHiddenObserver.disconnect()
    super.disconnectedCallback()
  }

  initAriaCurrentMonitoring () {
    setTimeout(() => { this.setAriaCurrentForSubNavigation() }, 100)
    if (typeof MutationObserver !== 'undefined') {
      this.ariaCurrentObserver = new MutationObserver((mutations) => {
        let shouldCheck = false
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            for (const node of mutation.addedNodes) {
              if (node.nodeType === Node.ELEMENT_NODE && (node.querySelector && node.querySelector('a[href]'))) {
                shouldCheck = true
                break
              }
            }
          }
          if (mutation.type === 'attributes' && mutation.attributeName === 'aria-expanded') shouldCheck = true
        })
        if (shouldCheck) setTimeout(() => {this.setAriaCurrentForSubNavigation()}, 50)
      })
      this.ariaCurrentObserver.observe(this, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['aria-expanded']
      })
    }
    
    this.addEventListener('click', (event) => {if (event.target.closest('a[aria-haspopup], [aria-expanded]')) setTimeout(() => {this.setAriaCurrentForSubNavigation()}, 100)})
  }

  attributeChangedCallback (name, oldValue, newValue) {
    if (newValue === 'true') this.root.querySelector('nav > ul > li > a')?.focus()
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
    return !this.nav
  }

  /**
   * renders the m-multi-level-navigation css
   *
   * @return {Promise<void>|void}
   */
  renderCSS () {
    this.css = /* css */`
    /* hide component stuff before it is rendered to avoid the blitz (flashing white) */
    :not(:defined) {
      display: none;
    }
    
    /* for screen readers */
    .visually-hidden {
      position: absolute !important;
      width: 1px !important;
      height: 1px !important;
      padding: 0 !important;
      margin: -1px !important;
      overflow: hidden !important;
      clip: rect(0, 0, 0, 0) !important;
      white-space: nowrap !important;
      border: 0 !important;
    }
    
    :host {
      color: black;
      overscroll-behavior: contain;
    }
    
    :host > nav > ul {
      position: relative;
      align-items: var(--main-ul-align-items, normal);
      justify-content: var(--main-ul-justify-content, normal);
      display: var(--main-ul-display, flex);
      flex-wrap: var(--flex-wrap, nowrap);
      flex-direction: var(--flex-direction, row);
      padding: var(--padding, 0);
      margin: var(--margin, 0);
    }
    :host > nav > ul > li {
      display: block;
      padding: var(--li-padding, 0);
      --a-transition: none;
      --a-main-content-spacing:  1rem 0.8rem 0 0.8rem;
    }
    :host > nav > ul > li > div.main-background {
      display: none;
      background-color: var(--m-gray-500);
      position: fixed;
      width: 100vw;
      height: 100vh;
      left: 0;
      top: 0;
      opacity: 0;
    }
    :host > nav > ul > li.open > div.main-background {
      display: block;
    }
    :host > nav > ul > li > div.main-background.hide {
      animation: FadeOutBackground 0.3s ease-in-out forwards !important;
    }
    :host > nav > ul > li.active > a:hover > span {
      color: var(--color-hover);
    }
    :host > nav > ul > li.active > a:after {
      background-color: var(--color-active);
    }
    :host > nav > ul > li.active > a > span {
      color: var(--color-active);
    }
    :host > nav > ul > li > a:after {
      position: absolute;
      bottom: -0.75rem;
      right: 50%;
      background-color: transparent;
      content: "";
      display: block;
      height: var(--a-main-border-width);
      width: 90%;
      transform: translate(50%,50%);
    }
    :host > nav > ul > li > a:hover:after {
      background-color: var(--color-active);
    }
    :host > nav > ul > li > a {
      position:relative;
      display: var(--a-main-display, inline);
      color: var(--color);
      padding: var(--a-main-content-spacing, 14px 10px);
      font-size: var(--a-main-font-size, 1rem);
      font-weight: var(--a-main-font-weight, 400);
      line-height: var(--a-main-line-height);
      text-transform: var(--a-main-text-transform);
      font-family: var(--a-main-font-family, var(--font-family));
      font-weight: var(--a-font-weight, var(--font-weight, normal));
      text-align: var(--a-text-align, left);
      width: var(--a-width, auto);
      --content-spacing: 0;
    }
    :host > nav > ul > li > a > span {
      padding: 0 0 0.75rem 0;
      font-weight: var(--a-main-font-weight, 400);
    }
    :host > nav > ul > li > a:hover,
    :host > nav > ul > li > a:active,
    :host > nav > ul > li > a:focus {
      color: var(--color-hover);
    }
    :host > nav > ul > li > o-nav-wrapper {
      display: none !important;
      position: absolute;
      top: var(--o-nav-wrapper-top, 2em);
      left: calc(0 - var(--logo-default-width,var(--width, auto)));
      right: 0;
      width: calc(100% + var(--logo-default-width,var(--width, auto)));
      border-top: var(--desktop-main-wrapper-border-width, 1px) var(--desktop-main-wrapper-border-style, solid) var(--desktop-main-wrapper-border-color, black);
      overflow: visible;
    }
    :host > nav > ul > li.open > o-nav-wrapper {
      display: flex !important;
    }
    :host > nav > ul > li > o-nav-wrapper div.wrapper-background {
      display: none;
      background-color: var(--desktop-main-wrapper-background-color, white);
      width: var(--desktop-main-wrapper-width, 100vw);
      height: var(--desktop-main-wrapper-height, 100%);
      animation: none !important;
      position: var(--desktop-main-wrapper-position, relative);
      left: var(--desktop-main-wrapper-position-left, 50%);
      right: var(--desktop-main-wrapper-position-right, 50%);
      margin-left: -50vw;
      margin-right: -50vw;
    }
    :host > nav > ul > li > o-nav-wrapper.hide {
      --show: slideOutToTop 0.3s ease-in-out forwards;
    }
    :host > nav > ul > li.open > o-nav-wrapper.no-animation {
      --show: none;
    }
    :host > nav > ul > li.open > o-nav-wrapper div.wrapper-background {
      display: block;
    }
    :host > nav > ul > li > o-nav-wrapper > section {
      --gap: 1.25em;
     padding: var(--multi-level-navigation-default-o-nav-wrapper-padding, 2em 0 1.5em 0);
    }
    :host > nav > ul > li > o-nav-wrapper > section > div {
      /* this setting is quite fragile here, we need to improve it for reusability */
      width: calc(calc(100% - 2 * var(--gap)) / 3) !important;
      position: relative;
      height: 100%;
      background-color: var(--sub-navigation-wrapper-background-color, white);
    }
    :host > nav > ul > li > o-nav-wrapper > section > div:first-of-type {
      --show: none;
      z-index: 999;
    }
    :host > nav > ul > li > o-nav-wrapper > section > div:not(:first-of-type) {
      --show: desktopOpenLeft 0.3s ease-in-out forwards;
      z-index: 998;
    }
    :host > nav > ul > li > o-nav-wrapper > section > div:last-of-type {
      z-index: 997;
    }
    :host > nav > ul > li > o-nav-wrapper > section > div:not(:last-of-type):after {
      display: block;
      content: '';
      background: var(--multi-level-navigation-default-desktop-main-wrapper-border-color, black);
      position: absolute;
      top: 4px;
      right: -0.5em;
      height: 100%;
      width: var(--multi-level-navigation-default-desktop-main-wrapper-border-width, 1px);
    }
    :host > nav > ul > li > o-nav-wrapper > section > div > ul {
      height: 100%;
      position: relative;
      overflow-y: auto;
      overflow-x: visible;
    }
    :host > nav > ul > li > o-nav-wrapper > section > div:hover > ul::-webkit-scrollbar {
      background-color: var(--multi-level-navigation-default-desktop-sub-navigation-wrapper-scrollbar-background-color, black);
    }
    :host > nav > ul > li > o-nav-wrapper > section > div:hover > ul::-webkit-scrollbar-thumb {
      background: var(--multi-level-navigation-default-desktop-sub-navigation-wrapper-scrollbar-thumb-background-color, black);
    }
    :host > nav > ul > li > o-nav-wrapper > section .close-icon {
      position: absolute;
      right: 0;
      top: 0.25em;
      width: auto !important;
      --icon-link-list-color: var(--color);
      --icon-link-list-color-hover: var(--color);
      --icon-link-list-show: none;
    }
    :host > nav > ul > li > o-nav-wrapper > section > div > ul::-webkit-scrollbar {
      background-color: transparent;
      width: 5px;
    }
    :host > nav > ul > li > o-nav-wrapper > section > div > ul::-webkit-scrollbar-thumb {
      background: transparent;
    }
    :host > nav > ul > li > o-nav-wrapper > section > div > ul li {
      margin: 0 4px; /* space for outlines */
    }
    :host > nav > ul > li > o-nav-wrapper > section > div > ul > li.list-title {
      padding: 1em;
      --ul-li-padding-left: 0.75em;
      --a-font-weight: 500;
      --a-font-size: 1.25rem;
      --a-color: var(--color-active);
      --a-color-hover: var(--color-active);
      --line-height: 1.375rem;
    }
    :host > nav > ul > li > o-nav-wrapper > section ul li {
      --ul-li-padding-left: 0;
    }
    :host > nav > ul > li > o-nav-wrapper > section > div > ul > li.list-title > a > span {
      font-size: 0.8em !important;
      color: var(--color) !important;
      font-weight: 300 !important;
      padding-left: 0.5rem;
      line-height: 1.25rem;
    }
    :host > nav > ul > li > o-nav-wrapper > section > div > ul > li.list-title > a:hover > span {
      text-decoration: underline;
      color: var(--color-active) !important;
    }
    @media only screen and (min-height: ${this.desktopHeightBreakpoint + 'px'}) {
      :host > nav > ul > li > o-nav-wrapper,
      :host > nav > ul > li > o-nav-wrapper div.wrapper-background {
        height: var(--desktop-main-wrapper-height, 50vh);
      }
    }
    @media only screen and (max-height: ${this.desktopHeightBreakpoint + 'px'}) {
      :host > nav > ul > li > o-nav-wrapper,
      :host > nav > ul > li > o-nav-wrapper div.wrapper-background {
        height: var(--mobile-main-wrapper-height, 60vh);
      }
    }

    /* Mobile layout */
    @media only screen and (max-width: _max-width_) {
      :host {
        --ul-li-padding-left: 0;
      }
      :host .close-left-slide {
        animation: mobileCloseLeft ${this.animationDurationMs + 'ms'} ease-in-out forwards;
      }
      :host .open-left-slide {
        animation: mobileOpenLeft ${this.animationDurationMs + 'ms'} ease-in-out forwards;
      }
      :host .close-right-slide {
        animation: mobileCloseRight ${this.animationDurationMs + 'ms'} ease-in-out forwards;
      }
      :host .open-right-slide {
        animation: mobileOpenRight ${this.animationDurationMs + 'ms'} ease-in-out forwards;
      }
      :host .navigation-back {
        display: flex;
        width: fit-content;
        padding: var(--a-main-mobile-padding);
        color: var(--color);
        font-weight: 500;
        margin: 0;
      }
      :host .navigation-back a-icon-mdx {
        --icon-link-list-color: var(--multi-level-navigation-default-mobile-icon-background-color);
      }
      :host .grey-background {
        background-color: var(--grey-background-color, #EDEDED);
      }
      :host li.list-title {
        padding: 1em 0;
        --a-color: var(--color-active);
        --a-color-hover: var(--color-active);
      }
      :host li.list-title a {
        font-weight: 500;
        font-size: 1.25rem;
      }
      :host li.list-title a span {
        font-weight: 300;
        font-size: 0.8em;
        color: var(--color);
        padding: 0.3rem;
      }
      :host > nav {
        position: relative;
        height: 100%;
        width: 100vw;
        overflow: hidden;
        padding-top: 0;
      }
      :host > nav > ul {
        display: block;
        position: absolute;
        border-top: var(--mobile-wrapper-border-width, 1px) var(--mobile-wrapper-border-style, solid) var(--mobile-wrapper-border-color, black);
        width: 100vw;
        height: 100%;
        overflow: auto;
      }
      :host > nav > div {
        position: absolute;
        border-top: var(--mobile-wrapper-border-width, 1px) var(--mobile-wrapper-border-style, solid) var(--mobile-wrapper-border-color, black);
        width: 100vw;
        right: -100vw;
        height: 100%;
        overflow: hidden;
      }
      :host > nav > ul.open {
        margin: 1em 0;
      }
      :host > nav > ul > li {
        width: 100%;
        margin: 1px 0;
      }
      :host > nav > div[nav-level] ul {
        padding-left: 0.5rem;
      }
      :host > nav > ul > li > a {
        display: flex;
        justify-content: space-between;
        margin: 0;
        font-weight: 500;
        font-size: var(--a-main-mobile-font-size, 1rem);
        padding: var(--a-main-mobile-padding);
        line-height: var(--a-main-mobile-line-height);
      }
      :host > nav > ul > li > a:after{
        display: none;
      }
      :host > nav > ul > li > a > span {
       padding: 0;
       color: var(--color) !important;
       align-self: center;
      }
    }
    /*Animations */
    @keyframes slideInFromTop {
      0% {
        opacity: 0;
        transform: translateY(-5em);
        pointer-events: none;
      }
      100% {
        opacity: 1;
        transform: translateY(0);
        pointer-events: auto;
        }
      }
      @keyframes slideOutToTop {
        0% {
          opacity: 1;
          transform: translateY(0);
          pointer-events: none;
        }
        100% {
          opacity: 0;
          transform: translateY(-5em);
          }
        }
      @keyframes FadeInBackground {
        0% {
          opacity: 0;
        }
        100% {
          opacity: 0.45;
          }
        }
      @keyframes FadeOutBackground {
        0% {
          opacity: 0.45;
        }
        100% {
          opacity: 0;
          }
        }
      @keyframes mobileOpenRight {
        0% {
          right: -100vw;
          pointer-events: none;
        }
        100% {
          right: 0;
          overflow: auto;
          pointer-events: auto;
        }
      }
      @keyframes mobileCloseRight {
        0% {
          right: 0;
          pointer-events: none;
        }
        100% {right: -100vw}
      }
      @keyframes mobileCloseLeft {
        0% {
          right: 0;
          pointer-events: none;
        }
        100% { 
          right: 100vw
        }
      }
      @keyframes mobileOpenLeft {
        0% {
          right: 100vw;
          pointer-events: none;
        }
        100% { 
          right: 0;
          overflow: auto;
          pointer-events: auto;
        }
      }
      @keyframes desktopOpenLeft {
        0% {
          opacity: 0;
          right: 5em;
          pointer-events: none;
        }
        100% { 
          opacity: 1;
          right: 0;
          pointer-events: auto;
        }
      }
    `

    this.setCss(/* css */`
    :host li.hover-active m-nav-level-item {
      --nav-level-item-default-background-color: var(--nav-level-item-default-hover-background-color);
    }
    :host li m-nav-level-item {
      --nav-level-item-default-font-size: 1rem;
      --nav-level-item-default-height: 2.75em;
      --nav-level-item-default-margin: 2px 2px 2px 0;
      --nav-level-item-default-font-weight: 500;
      --color: var(--a-color);
    }
    :host > nav > ul > li > o-nav-wrapper {
      --show: slideInFromTop 0.3s ease-in-out forwards;
      --justify-content: start;
      --align-items: start;
      --ul-padding-left: 0;
    }
    @media only screen and (max-width: _max-width_) {
      :host li m-nav-level-item {
        --nav-level-item-default-height: 3.25em;
        --nav-level-item-default-padding: 0 0.75em 0 0;
        --nav-level-item-default-margin: 1px 0;
        --nav-level-item-default-hover-background-color: white;
        --nav-level-item-default-hover-color: var(--color);
      }
    }
    `, undefined, false, false)
    return this.fetchTemplate()
  }

  /**
   * fetches the template
   *
   * @return {Promise<void>}
   */
  fetchTemplate () {
    /** @type {import('../../prototypes/Shadow.js').fetchCSSParams[]} */
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
      case 'multi-level-navigation-default-':
        return this.fetchCSS([{
          path: `${this.importMetaUrl}./default-/default-.css`, // apply namespace since it is specific and no fallback
          namespace: false,
          replaces: [{
            pattern: '--multi-level-navigation-default-',
            flags: 'g',
            replacement: '--multi-level-navigation-default-'
          }]
        }, ...styles], false)
      case 'multi-level-navigation-delica-':
        return this.fetchCSS([{
          path: `${this.importMetaUrl}./delica-/delica-.css`, // apply namespace since it is specific and no fallback
          namespace: false,
          replaces: [{
            pattern: '--multi-level-navigation-delica-',
            flags: 'g',
            replacement: '--multi-level-navigation-delica-'
          }]
        }, ...styles], false)
      default:
        return Promise.resolve()
    }
  }

  /**
   *
   *
   * @return {Promise<void>|void}
   */
  renderHTML (clonedNav) {
    this.nav = clonedNav || this.root.querySelector('nav') || document.createElement('nav')
    this.nav.setAttribute('aria-labelledby', 'hamburger')
    this.nav.setAttribute('aria-expanded', 'false')
    Array.from(this.root.children).forEach(node => {
      if (node.getAttribute('slot') || node.nodeName === 'STYLE' || node.tagName === 'NAV') return false
      this.nav.appendChild(node)
    })
    
    this.addNavigationHeadings() // headings for screen readers
    
    this.html = this.nav
    return new Promise(resolve => {
      if (this.isDesktop) {
        setTimeout(() => {
          resolve(this.renderDesktopHTML())
        }, 0)
      } else {
        setTimeout(() => {
          resolve(this.renderMobileHTML())
        }, 0)
      }
    })
  }

  /**
   *
   *
   * @param {'mobile' | 'desktop'} [media=this.getAttribute('media')]
   * @returns {boolean}
   * @memberof IntersectionScrollEffect
   */
  checkMedia (media = this.getAttribute('media')) {
    const isMobile = self.matchMedia(`(max-width: ${this.mobileBreakpoint})`).matches
    return (isMobile ? 'mobile' : 'desktop') === media
  }

  /**
   * creates invisible headings (h1, h2, h3) for screen readers
   */
  addNavigationHeadings () {
    const nav = this.root.querySelector('nav')
    if (!nav) return
    const existingHeadings = nav.querySelectorAll('.navigation-heading')
    existingHeadings.forEach(heading => heading.remove())
    const mainHeading = document.createElement('h1')
    mainHeading.className = 'visually-hidden navigation-heading'
    mainHeading.textContent = this.getAttribute('main-nav-title') || this.getAttribute('aria-label') || 'Hauptnavigation'
    mainHeading.id = 'main-navigation-heading'
    const firstChild = nav.firstChild
    nav.insertBefore(mainHeading, firstChild)
    setTimeout(() => { this.addSubNavigationHeadings() }, 100)
  }

  addSubNavigationHeadings () {
    const navWrappers = this.root.querySelectorAll('o-nav-wrapper')
    navWrappers.forEach((wrapper, wrapperIndex) => {
      const sections = wrapper.querySelectorAll('section')
      sections.forEach((section, sectionIndex) => {
        const navLevelDivs = section.querySelectorAll('div[nav-level]')
        navLevelDivs.forEach(div => {
          const navLevel = parseInt(div.getAttribute('nav-level') || '1')
          const headingLevel = Math.min(navLevel + 1, 6) // h2, h3, h4, h5, h6 (max h6)
          if (!div.querySelector('.sub-navigation-heading')) {
            const subHeading = document.createElement(`h${headingLevel}`)
            subHeading.className = 'visually-hidden sub-navigation-heading navigation-heading'
            const parentLi = this.findParentLiForNavLevel(div, navLevel)
            const headingText = this.getNavigationHeadingText(parentLi, navLevel)
            subHeading.textContent = headingText
            subHeading.id = `sub-navigation-heading-${wrapperIndex}-${sectionIndex}-${navLevel}`
            div.insertBefore(subHeading, div.firstChild)
          }
        })
      })
    })

    const mobileNavDivs = this.root.querySelectorAll('nav > div[nav-level]')
    mobileNavDivs.forEach((div, index) => {
      const navLevel = parseInt(div.getAttribute('nav-level') || '1')
      const headingLevel = Math.min(navLevel + 1, 6)
      if (!div.querySelector('.mobile-navigation-heading')) {
        const mobileHeading = document.createElement(`h${headingLevel}`)
        mobileHeading.className = 'visually-hidden mobile-navigation-heading navigation-heading'
        const headingText = this.getMobileNavigationHeadingText(div, navLevel)
        mobileHeading.textContent = headingText
        mobileHeading.id = `mobile-navigation-heading-${index}-${navLevel}`
        div.insertBefore(mobileHeading, div.firstChild)
      }
    })
  }

  findParentLiForNavLevel (navDiv, level) {
    if (level === 1) {
      const wrapper = navDiv.closest('o-nav-wrapper')
      return wrapper ? wrapper.parentElement : null
    }
    return null
  }

  getNavigationHeadingText (parentLi, level) {
    if (level === 1 && parentLi) {
      const link = parentLi.querySelector('a')
      const span = link ? link.querySelector('span') : null
      const subNavSuffix = this.getAttribute('sub-nav-suffix') || '- Unternavigation'
      if (span && span.textContent.trim()) return `${span.textContent.trim()} ${subNavSuffix}`
      if (link && link.textContent.trim()) return `${link.textContent.trim()} ${subNavSuffix}`
    }
    const baseText = this.getAttribute('sub-nav-title') || 'Unternavigation'
    const levelText = this.getAttribute('level-text') || 'Level'
    const levelNames = {
      1: baseText,
      2: `${baseText} ${levelText} 2`, 
      3: `${baseText} ${levelText} 3`
    }
    return levelNames[level] || `${baseText} ${levelText} ${level}`
  }

  getMobileNavigationHeadingText (navDiv, level) {
    const backButton = navDiv.querySelector('.navigation-back')
    if (backButton) {
      const span = backButton.querySelector('span')
      if (span && span.textContent.trim()) return span.textContent.trim()
    }
    const mobileBaseText = this.getAttribute('mobile-nav-title') || this.getAttribute('sub-nav-title') || 'Mobile Unternavigation'
    const levelText = this.getAttribute('level-text') || 'Level'
    const levelNames = {
      1: mobileBaseText,
      2: `${mobileBaseText} ${levelText} 2`,
      3: `${mobileBaseText} ${levelText} 3`
    }
    return levelNames[level] || `${mobileBaseText} ${levelText} ${level}`
  }

  get style () {
    return this._style || (this._style = (() => {
      const style = document.createElement('style')
      style.setAttribute('protected', 'true')
      return style
    })())
  }

  addCustomColors () {
    Array.from(this.root.querySelectorAll('li')).forEach(li => {
      if (li.hasAttribute('main-color')) {
        li.style.setProperty('--multi-level-navigation-default-color-active', li.getAttribute('main-color'))
        li.style.setProperty('--multi-level-navigation-default-color-hover', li.getAttribute('main-color'))
      }
      if (li.hasAttribute('hover-color')) {
        li.style.setProperty('--multi-level-navigation-default-color-hover', li.getAttribute('hover-color'))
      }
    })
  }

  hideAndClearDesktopSubNavigation (event) {
    const navWrappers = Array.from(this.root.querySelectorAll('o-nav-wrapper'))
    const allOpenLiTags = Array.from(this.root.querySelectorAll('li.open'))
    const allActiveLiTags = Array.from(this.root.querySelectorAll('li.active'))

    navWrappers.forEach(wrapper => {
      const firstNavigationDiv = wrapper.querySelector('div[nav-level="1"]')
      const subNavigationDivs = Array.from(wrapper.querySelectorAll('div[nav-level]')).filter(div => +div.getAttribute('nav-level') > 1)
      navWrappers.forEach(wrapper => Array.from(wrapper.querySelectorAll('ul')).forEach(ul => ul.scrollTo(0, 0)))
      Array.from(wrapper.querySelectorAll('ul')).forEach(ul => ul.scrollTo(0, 0))
      Array.from(firstNavigationDiv.querySelectorAll('li')).forEach(li => {
        li.classList.remove('hover-active')
        li.setAttribute('aria-expanded', 'false')
      })
      if (subNavigationDivs.length) {
        subNavigationDivs.forEach(subNav => {
          if (event && !event.currentTarget.tagName) {
            setTimeout(() => {
              subNav.hidden = true
            }, this.removeElementAfterAnimationDurationMs)
          } else {
            subNav.hidden = true
          }
        })
      }
      if (wrapper.parentElement.classList.contains('open')) {
        wrapper.classList.remove('no-animation')
      }
    })

    allOpenLiTags.forEach(li => {
      // add fade-out animation on desktop if flyout closes
      let currentNavWrapper
      let backgroundDiv
      if ((currentNavWrapper = li.querySelector('li o-nav-wrapper')) && event && !event.currentTarget.tagName) {
        currentNavWrapper.classList.add('hide')
        backgroundDiv = li.querySelector('div.main-background')
        backgroundDiv.classList.add('hide')
        setTimeout(() => {
          backgroundDiv.classList.remove('hide')
          currentNavWrapper.classList.remove('hide')
          li.classList.remove('open')
        }, this.animationDurationMs)
      } else {
        li.classList.remove('open')
      }
      if (li.hasAttribute('aria-expanded')) li.setAttribute('aria-expanded', 'false')
      if (li.parentElement) li.parentElement.classList.remove('open')
    })

    allActiveLiTags.forEach(li => li.classList.remove('active'))
  }

  hideAndClearMobileSubNavigation () {
    const navElement = this.root.querySelector('nav')
    const navElementChildren = Array.from(navElement.children)
    if (this.getAttribute('aria-expanded') === 'false' && navElementChildren.length) {
      this.classList.remove('open')
      navElement.querySelector('ul').classList.remove('open-left-slide')
      setTimeout(() => {
        navElementChildren.forEach(childEl => {
          if (childEl.tagName === 'UL') {
            childEl.classList.remove('close-left-slide')
          }
          if (childEl.hasAttribute('nav-level')) {
            childEl.hidden = true
          }
        })
        this.hideMobileNavigation()
      }, this.removeElementAfterAnimationDurationMs)
    } else if (this.getAttribute('aria-expanded') === 'true') this.showMobileNavigation()
  }

  htmlReBuilderByLayoutChange () {
    const currentNav = this.root.querySelector('nav')
    if (this.isDesktop) {
      // set nav element from mobile to desktop compatible
      const mainATags = Array.from(currentNav.querySelectorAll('nav > ul > li > a'))
      const mobileSubNavs = Array.from(currentNav.querySelectorAll('nav > div[nav-level]'))
      const mainSections = Array.from(currentNav.querySelectorAll('nav > ul > li > section'))
      const menuIconElement = currentNav.querySelector('a-menu-icon')
      if (menuIconElement) menuIconElement.setAttribute('aria-hidden', 'true')

      if (mainSections.length > 0) {
        mainSections.forEach(section => {
          section.removeAttribute('hidden')
          const templateWrapper = document.createElement('template')
          section.parentNode.insertBefore(templateWrapper, section)
          templateWrapper.content.appendChild(section)
        })
      }

      if (mainATags.length > 0) {
        mainATags.forEach(a => {
          const aTagChildren = Array.from(a.children)
          const aTagMDXIcon = aTagChildren?.find(child => child.tagName === 'A-ICON-MDX')
          if (aTagChildren.length && aTagMDXIcon) aTagMDXIcon.parentElement.removeChild(aTagMDXIcon)
        })
      }

      if (mobileSubNavs.length > 0) {
        mobileSubNavs.forEach(subNav => subNav.parentElement.removeChild(subNav))
      }
    } else {
      // set nav from desktop to mobile compatible
      const desktopOWrappers = Array.from(currentNav.querySelectorAll('o-nav-wrapper'))
      const allCurrentHoveredElement = Array.from(currentNav.querySelectorAll('.hover-active'))
      const desktopMainFlyoutBackgrounds = Array.from(currentNav.querySelectorAll('div.main-background'))
      const menuIconElement = currentNav.querySelector('a-menu-icon')
      if (menuIconElement) menuIconElement.setAttribute('aria-hidden', 'false')
      if (desktopOWrappers.length > 0) {
        desktopOWrappers.forEach(wrapper => {
          // remove close icon append section
          let closeIcon
          let wrapperSection
          wrapper.parentElement.classList.remove('open')
          wrapper.parentElement.classList.remove('active')
          if ((closeIcon = wrapper.querySelector('section a.close-icon'))) closeIcon.parentElement.removeChild(closeIcon)
          if ((wrapperSection = wrapper.querySelector('section'))) {
            const subNavigationDivs = Array.from(wrapperSection.querySelectorAll('div[nav-level]'))
            if (subNavigationDivs.length > 0) subNavigationDivs.forEach(div => (div.hidden = false))
            wrapper.parentElement.appendChild(wrapperSection)
            wrapper.parentElement.removeChild(wrapper)
          }
        })
      }
      if (allCurrentHoveredElement.length > 0) {
        allCurrentHoveredElement.forEach(el => {
          el.classList.remove('hover-active')
          el.setAttribute('aria-expanded', 'false')
        })
      }
      // remove added faded background effect on desktop
      if (desktopMainFlyoutBackgrounds.length > 0) {
        desktopMainFlyoutBackgrounds.forEach(div => div.parentElement.removeChild(div))
      }
    }
    this.renderHTML(currentNav)
  }

  setScrollOnBody (isScrollOnBodyEnabled, event) {
    if (event.target.nodeName !== 'O-BODY') {
      this.dispatchEvent(new CustomEvent(this.getAttribute('no-scroll') || 'no-scroll', {
        detail: {
          hasNoScroll: isScrollOnBodyEnabled,
          origEvent: event,
          this: this
        },
        bubbles: true,
        cancelable: true,
        composed: true
      }))
    }
  }

  setDesktopMainNavItems (event) {
    const isOpen = event.currentTarget.classList.contains('open')
    let isFlyoutOpen = false
    event.preventDefault()
    event.stopPropagation()
    if (this.hasAttribute('no-scroll')) this.setScrollOnBody(true, event)
    // clean state between main li switching
    if (event.currentTarget.parentNode?.parentNode?.parentNode?.tagName === 'NAV') {
      const logoWidth = Math.ceil(this.parentElement.querySelector('a-logo').getBoundingClientRect().width) + 'px'
      const currentUlElement = this.root.querySelector('nav > ul')
      const ulPositionObj = currentUlElement.getBoundingClientRect()
      currentUlElement.style.setProperty('--multi-level-navigation-default-o-nav-wrapper-top', `calc(1.25rem + ${ulPositionObj.height + 1}px)`)
      currentUlElement.style.setProperty('--multi-level-navigation-default-logo-default-width', `${logoWidth}`)
      this.nav.setAttribute('aria-expanded', 'true')
      event.currentTarget.parentNode.setAttribute('aria-expanded', 'true')
      const link = event.currentTarget.parentNode.querySelector('a[aria-haspopup]')
      if (link) link.setAttribute('aria-expanded', 'true')
      isFlyoutOpen = Array.from(currentUlElement.querySelectorAll(':scope > li')).some(el => el.classList.contains('open'))
      // TODO: this should focus on the first element in the dropdown on desktop but does not have an effect
      if (!isFlyoutOpen) event.currentTarget.nextElementSibling.querySelector(this.focusElSelector)?.focus()
      if (this.hasAttribute('close-other-flyout')) this.dispatchEvent(new CustomEvent(this.getAttribute('close-other-flyout') || 'close-other-flyout', { bubbles: true, cancelable: true, composed: true }))
      this.addBackgroundDivPosition(event, isFlyoutOpen)
      this.hideAndClearDesktopSubNavigation(event)
    }
    event.currentTarget.parentNode.classList[isOpen ? 'remove' : 'add']('open')
    event.currentTarget.parentNode.classList.add('active')
    // remove animation if flyout is open
    if (isFlyoutOpen) event.currentTarget.parentElement.querySelector('o-nav-wrapper').classList.add('no-animation')
  }

  setMobileMainNavItems (event) {
    // set the currently clicked/touched aria expanded attribute
    event.currentTarget.parentNode.setAttribute('aria-expanded', 'true')
    const link = event.currentTarget.parentNode.querySelector('a[aria-haspopup]')
    if (link) link.setAttribute('aria-expanded', 'true')

    const navWrapper = this.root.querySelector('nav')
    const activeMainLiIndex = +event.currentTarget.parentNode.getAttribute('sub-nav-control')
    const activeFirstLevelSubNav = navWrapper.querySelector(`[nav-level="1"][parent-main-nav="${activeMainLiIndex}"]`)

    // hide element with left slide animation
    activeFirstLevelSubNav.hidden = false
    setTimeout(() => activeFirstLevelSubNav.querySelector(this.focusElSelector)?.focus(), this.removeElementAfterAnimationDurationMs)
    event.currentTarget.parentNode.parentNode.classList.add('close-left-slide')
    event.currentTarget.parentNode.parentNode.classList.remove('open-left-slide')
    activeFirstLevelSubNav.classList.add('open-right-slide')
  }

  handleOnClickOnDesktopSubNavItems (event) {
    const wrapperDiv = event.currentTarget.parentElement.parentElement.parentElement
    const wrapperDivNextSiblingDiv = wrapperDiv.nextSibling
    const wrapperDivNextSiblingDivUls = Array.from(wrapperDivNextSiblingDiv.querySelectorAll('ul'))
    let wrapperDivSecondNextSiblingDiv = null
    let wrapperDivSecondNextSiblingDivUls = null
    if (wrapperDivNextSiblingDiv.nextSibling) wrapperDivSecondNextSiblingDiv = wrapperDivNextSiblingDiv.nextSibling
    if (wrapperDivSecondNextSiblingDiv && Array.from(wrapperDivSecondNextSiblingDiv.querySelectorAll('ul')).length) wrapperDivSecondNextSiblingDivUls = Array.from(wrapperDivSecondNextSiblingDiv.querySelectorAll('ul'))

    Array.from(wrapperDiv.querySelectorAll('li')).forEach(li => {
      if (li.hasAttribute('aria-expanded')) li.setAttribute('aria-expanded', 'false')
      li.classList.remove('hover-active')
      li.setAttribute('aria-expanded', 'false')
      const link = li.querySelector('a[aria-haspopup]')
      if (link) link.setAttribute('aria-expanded', 'false')
    })

    event.currentTarget.parentNode.classList.add('hover-active')
    event.currentTarget.parentNode.setAttribute('aria-expanded', 'true')
    const link = event.currentTarget.parentNode.querySelector('a[aria-haspopup]')
    if (link) link.setAttribute('aria-expanded', 'true')

    let subUl = null
    if (wrapperDivNextSiblingDiv && wrapperDivNextSiblingDivUls.length && (subUl = wrapperDivNextSiblingDivUls.find(ul => ul.getAttribute('sub-nav-id') === event.currentTarget.parentNode.getAttribute('sub-nav')))) {
      wrapperDivNextSiblingDiv.hidden = true
      wrapperDivNextSiblingDivUls.forEach(ul => {
        ul.style.display = 'none'
        Array.from(ul.querySelectorAll('li')).forEach(li => {
          li.classList.remove('hover-active')
          li.setAttribute('aria-expanded', 'false')
          const link = li.querySelector('a[aria-haspopup]')
          if (link) link.setAttribute('aria-expanded', 'false')
        })
      })
      subUl.parentElement.hidden = false
      subUl.style.display = 'block'
      subUl.querySelector(this.focusElSelector)?.focus()
      subUl.scrollTo(0, 0)
      if (wrapperDivSecondNextSiblingDiv) wrapperDivSecondNextSiblingDiv.hidden = true
      if (wrapperDivSecondNextSiblingDivUls) wrapperDivSecondNextSiblingDivUls.forEach(ul => (ul.style.display = 'none'))
    }
  }

  handleAnchorClickOnNavItems (event) {
    this.dispatchEvent(new CustomEvent(this.getAttribute('click-anchor') || 'click-anchor', {
      detail: {
        selector: event.currentTarget.getAttribute('href')
      },
      bubbles: true,
      cancelable: true,
      composed: true
    }))
  }

  handleNewTabNavigationOnNavItems (event) {
    event.preventDefault()
    setTimeout(() => this.removeAttribute('style'), 3000)
    self.open(event.currentTarget.getAttribute('href'), event.currentTarget.getAttribute('target') || '_self')
  }

  handleOnClickOnMobileSubNavItems (event) {
    const wrapperDiv = event.currentTarget.parentElement.parentElement.parentElement
    const wrapperDivNextSiblingDiv = wrapperDiv.nextSibling
    const wrapperDivNextSiblingDivUls = Array.from(wrapperDivNextSiblingDiv.querySelectorAll('ul'))
    let wrapperDivSecondNextSiblingDiv = null
    let wrapperDivSecondNextSiblingDivUls = null
    if (wrapperDivNextSiblingDiv.nextSibling) wrapperDivSecondNextSiblingDiv = wrapperDivNextSiblingDiv.nextSibling
    if (wrapperDivSecondNextSiblingDiv && Array.from(wrapperDivSecondNextSiblingDiv.querySelectorAll('ul')).length) wrapperDivSecondNextSiblingDivUls = Array.from(wrapperDivSecondNextSiblingDiv.querySelectorAll('ul')) // eslint-disable-line

    event.currentTarget.parentNode.setAttribute('aria-expanded', 'true')

    let subUl = null
    if (wrapperDivNextSiblingDiv && wrapperDivNextSiblingDivUls.length && (subUl = wrapperDivNextSiblingDivUls.find(ul => ul.getAttribute('sub-nav-id') === event.currentTarget.parentNode.getAttribute('sub-nav')))) {
      wrapperDivNextSiblingDivUls.forEach(ul => {
        ul.style.display = 'none'
      })
      setTimeout(() => {
        wrapperDiv.scrollTo(0, 0)
        subUl.querySelector(this.focusElSelector)?.focus()
      }, this.removeElementAfterAnimationDurationMs)

      wrapperDivNextSiblingDiv.scrollTo(0, 0)
      wrapperDivNextSiblingDiv.hidden = false
      subUl.style.display = 'block'
      wrapperDiv.className = ''
      wrapperDiv.classList.add('close-left-slide')
      wrapperDivNextSiblingDiv.className = ''
      wrapperDivNextSiblingDiv.classList.add('open-right-slide')
    }
  }

  renderDesktopHTML () {
    Array.from(this.root.querySelectorAll('a')).forEach(a => {
      a.addEventListener('click', this.aLinkClickListener)
      if (!a.parentElement.hasAttribute(('only-mobile'))) {
        a.addEventListener('mouseover', this.aMainLinkHoverListener, { once: true })
        a.addEventListener('focus', this.aMainLinkHoverListener, { once: true })
      }
    })
    Array.from(this.root.querySelectorAll('[only-mobile]')).forEach(node => {
      node.style.display = 'none'
    })
    const mainNavigationLiTags = this.root.querySelectorAll('nav > ul > li')
    mainNavigationLiTags.forEach(li => {
      li.setAttribute('aria-expanded', 'false')
      li.setAttribute('aria-controls', 'nav-level-1')
    })
    this.html = this.style
  }

  renderMobileHTML () {
    const eventListenersForMobileNav = ['click', 'touchstart']

    Array.from(this.root.querySelectorAll('nav > ul > li')).forEach((mainLi, index) => {
      let currentATag
      if ((currentATag = mainLi.querySelector('a')) && (!currentATag.hasAttribute('href') || currentATag.getAttribute('href') === '' || currentATag.getAttribute('href') === '#')) {
        mainLi.querySelector('a').insertAdjacentHTML('beforeend', /* html */`
        <a-icon-mdx namespace='icon-link-list-' icon-name='ChevronRight' size='1.5em' rotate='0' class='icon-right'></a-icon-mdx>
        `)
      }
    })

    Array.from(this.root.querySelectorAll('[only-mobile]')).forEach(node => {
      let currentSubSection
      if (currentSubSection = node.querySelector('section')) {
        currentSubSection.setAttribute('hidden', 'true')
      }
    })

    eventListenersForMobileNav.forEach(evt =>
      document.body.addEventListener(evt, (event) => {
        this.openAnimationDelayNeeded = false
        setTimeout(() => {
          Array.from(this.root.querySelectorAll('nav > ul > li > a')).forEach((a, i) => {
            a.addEventListener('click', this.aLinkClickListener)
            if (i === 0) a.focus()
          })
          Array.from(this.root.querySelectorAll('[only-mobile]')).forEach(node => {
            node.style.display = 'block'
          })
          const navElement = this.root.querySelector('nav')
          const templates = Array.from(navElement.querySelectorAll('ul > li > template'))
          // @ts-ignore
          if (templates.length) {
            templates.forEach(template => {
              this.setLoadCustomElementsAttribute(template)
              template.replaceWith(...template.content.childNodes)
            })
            this.fillMobileNavigation()
          }
        }, 1000)
      }, { once: true })
    )

    this.html = this.style
  }

  addBackgroundDivPosition (event, isFlyoutOpen) {
    const backgroundTopPosition = event.pageY + 150
    const mainFlyoutBackgroundDiv = event.currentTarget.parentElement.querySelector('.main-background')
    if (mainFlyoutBackgroundDiv) {
      mainFlyoutBackgroundDiv.style.top = `${backgroundTopPosition}px`
      mainFlyoutBackgroundDiv.style.animation = isFlyoutOpen ? 'FadeInBackground 0s ease-in-out forwards' : 'FadeInBackground 0.3s ease-in-out forwards'
    }
  }

  getMedia () {
    return self.matchMedia(`(min-width: calc(${this.mobileBreakpoint} + 1px))`).matches ? 'desktop' : 'mobile'
  }

  recalculateNavigationHeight () {
    setTimeout(() => {
      this.headerHeight = this.getRootNode().host.offsetHeight
      this.restOfHeight = window.screen.height * 0.9 - this.headerHeight
      this.oNavWrappers = this.root.querySelectorAll('o-nav-wrapper')
      if (this.oNavWrappers.length) {
        this.oNavWrappers.forEach(wrapper => {
          const allLiChildren = wrapper.querySelectorAll("div[nav-level='1'] > ul > li")
          if (allLiChildren.length > 9 && window.innerHeight < this.desktopHeightBreakpoint) {
            const wrapperBackgroundElement = wrapper.querySelector('.wrapper-background')
            wrapper.setAttribute('style', `--multi-level-navigation-default-mobile-main-wrapper-height: calc(90dvh - ${this.headerHeight}px)`)
            if (wrapperBackgroundElement) wrapperBackgroundElement.setAttribute('style', `--multi-level-navigation-default-desktop-main-wrapper-height: calc(90dvh - ${this.headerHeight}px)`)
          }
          if (allLiChildren.length > 9 && window.innerHeight > this.desktopHeightBreakpoint) {
            const wrapperBackgroundElement = wrapper.querySelector('.wrapper-background')
            wrapper.setAttribute('style', `--multi-level-navigation-default-desktop-main-wrapper-height: calc(85dvh - ${this.headerHeight}px)`)
            if (wrapperBackgroundElement) wrapperBackgroundElement.setAttribute('style', `--multi-level-navigation-default-desktop-main-wrapper-height: calc(85dvh - ${this.headerHeight}px)`)
          }
        })
      }
    }, 1000)
  }

  setActiveNavigationItemBasedOnUrl () {
    const subUrls = []
    const navigationItemsUrlNames = []
    const navigationItems = Array.from(this.root.querySelectorAll('nav > ul > li[url-name]'))
    window.location.pathname.split('/')?.filter((subUrl) => subUrl).slice(0, 2).forEach((urlName) => subUrls.push(urlName.toLowerCase()))
    navigationItems.forEach(li => navigationItemsUrlNames.push(li.getAttribute('url-name').toLowerCase()))
    if (subUrls.length > 0 && navigationItemsUrlNames.length > 0) {
      const activeNavigationName = navigationItemsUrlNames.filter((navUrl) => subUrls.includes(navUrl))[0]
      const activeNavigationItem = navigationItems?.filter((item) => item.getAttribute('url-name').toLowerCase() === activeNavigationName)[0]
      if (activeNavigationItem) {
        activeNavigationItem.classList.add('active')
        const activeLink = activeNavigationItem.querySelector('a')
        if (activeLink) this.setAriaCurrent(activeLink)
      }
    }
    this.setAriaCurrentForSubNavigation()
  }

  setAriaCurrent (activeLink) {
    if (!activeLink) return
    this.clearAriaCurrent()
    activeLink.setAttribute('aria-current', 'page')
  }

  clearAriaCurrent () {
    const allLinks = this.root.querySelectorAll('a[aria-current]')
    allLinks.forEach(link => link.removeAttribute('aria-current'))
  }

  initAriaCurrentMonitoring () {
    setTimeout(() => {this.setAriaCurrentForSubNavigation()}, 100)
    if (typeof MutationObserver !== 'undefined') {
      this.ariaCurrentObserver = new MutationObserver((mutations) => {
        let shouldCheck = false
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
            for (const node of mutation.addedNodes) {
              if (node.nodeType === Node.ELEMENT_NODE && (node.querySelector && node.querySelector('a[href]'))) {
                shouldCheck = true
                break
              }
            }
          }
          if (mutation.type === 'attributes' && mutation.attributeName === 'aria-expanded') shouldCheck = true
        })
        if (shouldCheck) setTimeout(() => {this.setAriaCurrentForSubNavigation()}, 50)
      })
      this.ariaCurrentObserver.observe(this, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['aria-expanded']
      })
    }
    this.addEventListener('click', (event) => {if (event.target.closest('a[aria-haspopup], [aria-expanded]')) setTimeout(() => {this.setAriaCurrentForSubNavigation()}, 100)})
  }

  setAriaCurrentForSubNavigation () {
    const currentPath = window.location.pathname
    const currentHash = window.location.hash
    const currentFullUrl = currentPath + currentHash
    let allNavLinks = this.root.querySelectorAll('a[href]')
    const componentLinks = this.querySelectorAll('a[href]')
    const allLinks = new Set([...allNavLinks, ...componentLinks])
    allNavLinks = Array.from(allLinks)
    let exactMatch = null
    let pathMatch = null
    let bestMatch = null
    let bestMatchScore = 0
    let relativeUrlMatch = null
    allNavLinks.forEach(link => {
      const href = link.getAttribute('href')
      if (!href || href === '#') return
      const normalizedHref = this.normalizeUrl(href)
      const normalizedCurrentPath = this.normalizeUrl(currentPath)
      const normalizedCurrentFullUrl = this.normalizeUrl(currentFullUrl)
      const isExactMatch = normalizedHref === normalizedCurrentFullUrl || normalizedHref === normalizedCurrentPath
      if (isExactMatch) {
        if (href.startsWith('/')) {
          relativeUrlMatch = link
        } else if (!relativeUrlMatch) {
          exactMatch = link
        }
      }
      if (normalizedCurrentPath.startsWith(normalizedHref) && normalizedHref !== '/' && normalizedHref.length > 1) {
        const matchScore = normalizedHref.length
        if (matchScore > bestMatchScore) {
          bestMatch = link
          bestMatchScore = matchScore
        }
      }
    })
    const targetLink = relativeUrlMatch || exactMatch || pathMatch || bestMatch
    if (targetLink) this.setAriaCurrent(targetLink)
  }
  normalizeUrl (url) {
    if (!url) return ''
    let normalizedUrl = url
    if (normalizedUrl.startsWith('http://') || normalizedUrl.startsWith('https://')) {
      try {
        const urlObj = new URL(normalizedUrl)
        normalizedUrl = urlObj.pathname
      } catch (e) {
        return ''
      }
    }
    if (!normalizedUrl.startsWith('/')) normalizedUrl = '/' + normalizedUrl
    if (normalizedUrl.length > 1 && normalizedUrl.endsWith('/')) normalizedUrl = normalizedUrl.slice(0, -1)
    return normalizedUrl
  }

  addAriaHiddenToDecorativeElements () {
    const decorativeSelectors = [
      '.main-background',
      '.grey-background', 
      '[class*="background"]:not([role])',
      '[class*="decoration"]:not([role])',
      '[class*="separator"]:not([role])'
    ]

    decorativeSelectors.forEach(selector => {
      const elements = this.root.querySelectorAll(selector)
      elements.forEach(element => {element.setAttribute('aria-hidden', 'true')})
    })

    this.markDecorativeIcons()
    this.markDecorativeText()
    
    setTimeout(() => {
      this.markDecorativeIcons()
      this.markDecorativeText()
    }, 100)
    
    setTimeout(() => {
      this.markDecorativeIcons() 
      this.markDecorativeText()
    }, 500)
    
    this.initAriaHiddenMonitoring()
  }

  markDecorativeIcons () {
    const allIcons = this.getAllIconsIncludingShadow()
    allIcons.forEach(icon => {if (this.isDecorativeIcon(icon)) icon.setAttribute('aria-hidden', 'true')})
  }

  getAllIconsIncludingShadow () {
    const icons = []
    const addIconsFromRoot = (root) => {
      const foundIcons = root.querySelectorAll('a-icon-mdx')
      foundIcons.forEach(icon => icons.push(icon))
      const elementsWithShadow = root.querySelectorAll('*')
      elementsWithShadow.forEach(element => {if (element.shadowRoot) addIconsFromRoot(element.shadowRoot)})
      const navLevelItems = root.querySelectorAll('m-nav-level-item')
      navLevelItems.forEach(item => {
        if (item.shadowRoot) {
          addIconsFromRoot(item.shadowRoot)
        } else if (item.connectedCallback || item.root) {
          setTimeout(() => {
            if (item.shadowRoot) {
              const shadowIcons = item.shadowRoot.querySelectorAll('a-icon-mdx')
              shadowIcons.forEach(icon => {
                if (!icons.includes(icon)) {
                  icons.push(icon)
                  if (this.isDecorativeIcon(icon)) {
                    icon.setAttribute('aria-hidden', 'true')
                  }
                }
              })
            }
          }, 50)
        }
      })
    }
    addIconsFromRoot(this.root)
    const oNavWrapper = this.closest('o-nav-wrapper') || this.querySelector('o-nav-wrapper')
    if (oNavWrapper) {
      addIconsFromRoot(oNavWrapper)
      if (oNavWrapper.shadowRoot) addIconsFromRoot(oNavWrapper.shadowRoot)
    }
    if (icons.length === 0) addIconsFromRoot(document)
    if (this.shadowRoot && this.shadowRoot !== this.root) addIconsFromRoot(this.shadowRoot)
    return icons
  }

  isDecorativeIcon (icon) {
    if (icon.hasAttribute('role')) return false
    const parentElement = icon.parentElement
    if (!parentElement) return true
    const iconName = icon.getAttribute('icon-name')
    if (iconName === 'X' || iconName === 'Close' || iconName === 'Menu') {
      if (parentElement.hasAttribute('tabindex') || 
          parentElement.tagName.toLowerCase() === 'button' ||
          parentElement.classList.contains('close-icon')) {
        return false
      }
    }
    if (iconName === 'ChevronRight' || iconName === 'ChevronDown' || iconName === 'Arrow') {
      const interactiveParent = parentElement.closest('[role="link"], [role="button"], [role="menuitem"], a, button')
      if (interactiveParent && interactiveParent.hasAttribute('role')) return true
    }
    return iconName === 'ChevronRight' || iconName === 'ChevronDown' || iconName === 'Arrow'
  }

  markDecorativeText () {
    const allSpans = this.getAllSpansIncludingShadow()
    allSpans.forEach(span => {
      const textContent = span.textContent?.trim()
      if (textContent === 'alle anzeigen' || textContent === 'tous afficher' || textContent === 'mostra tutto') span.setAttribute('aria-hidden', 'true')
    })
  }

  getAllSpansIncludingShadow () {
    const spans = []
    const addSpansFromRoot = (root) => {
      const foundSpans = root.querySelectorAll('span')
      foundSpans.forEach(span => spans.push(span))
      const elementsWithShadow = root.querySelectorAll('*')
      elementsWithShadow.forEach(element => {if (element.shadowRoot) addSpansFromRoot(element.shadowRoot)})
    }
    addSpansFromRoot(this.root)
    const oNavWrapper = this.closest('o-nav-wrapper') || this.querySelector('o-nav-wrapper')
    if (oNavWrapper) {
      addSpansFromRoot(oNavWrapper)
      if (oNavWrapper.shadowRoot) addSpansFromRoot(oNavWrapper.shadowRoot)
    }
    if (this.shadowRoot && this.shadowRoot !== this.root) addSpansFromRoot(this.shadowRoot)
    return spans
  }

  addScreenReaderLabels () {
    this.addNavigationLabels()
    this.addSubMenuLabels()
    this.addExpandCollapseLabels()
    this.addLandmarkLabels()
  }

  addNavigationLabels () {
    const nav = this.root.querySelector('nav')
    if (nav) {
      if (!nav.hasAttribute('aria-label') && !nav.hasAttribute('aria-labelledby')) {
        const mainNavTitle = this.getAttribute('main-nav-title') || 'Main Navigation'
        nav.setAttribute('aria-label', mainNavTitle)
      }
      if (!nav.hasAttribute('role')) nav.setAttribute('role', 'navigation')
    }
  }

  addSubMenuLabels () {
    const subMenus = this.root.querySelectorAll('[role="menu"], ul[mobile-navigation-name]')
    subMenus.forEach(menu => {
      const menuName = menu.getAttribute('mobile-navigation-name') || menu.getAttribute('aria-label') || this.getMenuNameFromContext(menu)
      if (menuName && !menu.hasAttribute('aria-label')) {
        const subNavTitle = this.getAttribute('sub-nav-title') || 'Sub Navigation'
        menu.setAttribute('aria-label', `${menuName} - ${subNavTitle}`)
      }
    })
  }

  addExpandCollapseLabels () {
    const expandableItems = this.root.querySelectorAll('[aria-haspopup="true"], [aria-controls]')
    expandableItems.forEach(item => {
      if (!item.hasAttribute('aria-label') && !item.hasAttribute('aria-labelledby')) {
        const linkText = item.textContent?.trim() || item.innerText?.trim() || 'Navigation Item'
        const isExpanded = item.getAttribute('aria-expanded') === 'true'
        const expandText = isExpanded ? 'collapse' : 'expand'
        const expandTextDE = isExpanded ? 'zuklappen' : 'aufklappen'
        const expandTextFR = isExpanded ? 'réduire' : 'développer'
        const expandTextIT = isExpanded ? 'comprimi' : 'espandi'
        
        const lang = document.documentElement.lang || 'en'
        let expandLabel = expandText
        
        if (lang.startsWith('de')) expandLabel = expandTextDE
        else if (lang.startsWith('fr')) expandLabel = expandTextFR
        else if (lang.startsWith('it')) expandLabel = expandTextIT
        
        item.setAttribute('aria-label', `${linkText} - ${expandLabel}`)
      }
    })
  }

  addLandmarkLabels () {
    const oNavWrapper = this.closest('o-nav-wrapper') || this.querySelector('o-nav-wrapper')
    if (oNavWrapper && !oNavWrapper.hasAttribute('aria-label')) {
      const wrapperLabel = this.getAttribute('main-nav-title') || 'Navigation Area'
      oNavWrapper.setAttribute('aria-label', wrapperLabel)
      oNavWrapper.setAttribute('role', 'banner')
    }
    
    const sections = this.root.querySelectorAll('section')
    sections.forEach((section, index) => {
      if (!section.hasAttribute('aria-label')) {
        const levelText = this.getAttribute('level-text') || 'Level'
        section.setAttribute('aria-label', `Navigation ${levelText} ${index + 1}`)
        section.setAttribute('role', 'region')
      }
    })
  }

  getMenuNameFromContext (menu) {
    const parentLi = menu.closest('li')
    if (parentLi) {
      const link = parentLi.querySelector('a')
      if (link) return link.textContent?.trim() || link.innerText?.trim() || null
    }
    const prevElement = menu.previousElementSibling
    if (prevElement && prevElement.tagName === 'A') return prevElement.textContent?.trim() || prevElement.innerText?.trim() || null
    return null
  }

  initAriaHiddenMonitoring () {
    if (!this.ariaHiddenObserver && typeof MutationObserver !== 'undefined') {
      this.ariaHiddenObserver = new MutationObserver((mutations) => {
        let needsUpdate = false
        mutations.forEach(mutation => {
          if (mutation.type === 'childList') {
            mutation.addedNodes.forEach(node => {
              if (node.nodeType === Node.ELEMENT_NODE) {
                if (node.tagName === 'M-NAV-LEVEL-ITEM' || node.querySelector('m-nav-level-item')) needsUpdate = true
                if (node.tagName === 'A-ICON-MDX' || node.querySelector('a-icon-mdx')) needsUpdate = true
              }
            })
          }
          if (mutation.target && mutation.target.shadowRoot) needsUpdate = true
        })
        if (needsUpdate) {
          setTimeout(() => {
            this.markDecorativeIcons()
            this.markDecorativeText()
            this.addScreenReaderLabels()
          }, 50)
        }
      })
      
      this.ariaHiddenObserver.observe(this, {
        childList: true,
        subtree: true,
        attributes: false
      })
      
      if (document.body) {
        this.ariaHiddenObserver.observe(document.body, {
          childList: true,
          subtree: true
        })
      }
    }
  }

  setMainNavigationFontSize () {
    const mainNavigation = this.root.querySelector('nav > ul')
    const fontSizeBreakPoint = Number(mainNavigation.getAttribute('font-size-breakpoint'))
    const mainNavigationSpans = Array.from(this.root.querySelectorAll('nav > ul > li:not([only-mobile], [show-only-mobile]) > a > span'))
    if (fontSizeBreakPoint || fontSizeBreakPoint !== 0) {
      if (this.isDesktop) {
        if (window.innerWidth > fontSizeBreakPoint) {
          mainNavigationSpans.forEach((span) => {
            span.style.fontSize = 'inherit'
          })
        } else {
          mainNavigationSpans.forEach((span) => {
            span.style.fontSize = '18px'
          })
        }
      } else {
        mainNavigationSpans.forEach((span) => {
          span.style.fontSize = 'inherit'
        })
      }
    }
  }

  hideMobileNavigation () {
    if (!this.isDesktop && !this.getRootNode().host.shadowRoot.querySelector('header > m-multi-level-navigation').classList.contains('hide')) {
      this.getRootNode().host.shadowRoot.querySelector('header > m-multi-level-navigation').classList.add('hide')
    }
  }

  showMobileNavigation () {
    if (!this.isDesktop && this.getRootNode().host.shadowRoot.querySelector('header > m-multi-level-navigation').classList.contains('hide')) {
      this.getRootNode().host.shadowRoot.querySelector('header > m-multi-level-navigation').classList.remove('hide')
      this.nav.setAttribute('aria-expanded', 'true')
    }
  }

  fillMobileNavigation () {
    // add list-item-element
    Array.from(this.root.querySelectorAll('nav > ul > li')).forEach((mainLi, index) => {
      if (mainLi.querySelector('section')) {
        mainLi.setAttribute('aria-expanded', 'false')
        mainLi.setAttribute('aria-controls', 'nav-level-1')
        mainLi.setAttribute('sub-nav-control', `${index}`)
      }
      // Add class for title li a element
      const subTitleLiTags = Array.from(mainLi.querySelectorAll('li')).filter(li => !li.querySelector('m-nav-level-item'))
      subTitleLiTags.forEach(li => li.classList.add('list-title'))
    })

    // extract section element
    Array.from(this.root.querySelectorAll('section')).forEach((section) => {
      Array.from(section.children).forEach(node => {
        const parentMainNav = section.parentElement.getAttribute('sub-nav-control')
        const clonedNode = node.cloneNode(true)
        const currentNodeAriaControlUlTags = clonedNode.querySelectorAll('ul[sub-nav-id]')
        const currentNodeExpandableLiTags = clonedNode.querySelectorAll('li[sub-nav]')
        Array.from(clonedNode.querySelectorAll('a')).forEach(a => a.addEventListener('click', this.aLinkClickListener))
        clonedNode.setAttribute('parent-main-nav', `${parentMainNav}`)
        clonedNode.style.setProperty('--multi-level-navigation-default-color-active', section.parentElement.getAttribute('main-color'))

        if (currentNodeExpandableLiTags.length > 0) currentNodeExpandableLiTags.forEach(li => li.setAttribute('aria-controls', `${li.getAttribute('sub-nav')}`))
        if (currentNodeAriaControlUlTags.length > 0) currentNodeAriaControlUlTags.forEach(ul => ul.setAttribute('id', `${ul.getAttribute('sub-nav-id')}`))
        if (+clonedNode.getAttribute('nav-level') === 1) clonedNode.setAttribute('id', 'nav-level-1')
        if (+clonedNode.getAttribute('nav-level') === 1) {
          // create new navigation back button
          const newNavBackATag = document.createElement('a')
          const mobileNavigationName = node.parentNode.parentNode.parentNode.getAttribute('mobile-navigation-name')
          newNavBackATag.innerHTML = /* HTML */`
       <a-icon-mdx namespace='icon-link-list-' icon-name='ChevronLeft' color='red' size='1.5em' rotate='0' class='icon-right'></a-icon-mdx>
       <span>${mobileNavigationName}</span>
       `
          newNavBackATag.classList.add('navigation-back')
          newNavBackATag.setAttribute('tabindex', '0')
          newNavBackATag.addEventListener('click', (event) => {
            // @ts-ignore
            event.currentTarget.parentNode.classList.remove('open-right-slide')
            // @ts-ignore
            event.currentTarget.parentNode.parentNode.querySelector('ul').scrollTo(0, 0)
            // @ts-ignore
            event.currentTarget.parentNode.parentNode.querySelector('ul').classList.remove('close-left-slide')
            // @ts-ignore
            event.currentTarget.parentNode.classList.add('close-right-slide')
            // @ts-ignore
            event.currentTarget.parentNode.parentNode.querySelector('ul').classList.add('open-left-slide')
            // @ts-ignore
            event.currentTarget.parentNode.parentNode.querySelector('ul').querySelector(this.focusElSelector)?.focus()
            // @ts-ignore
            const expandedElements = Array.from(event.currentTarget.parentNode.parentNode.querySelector('ul').querySelectorAll('[aria-expanded="true"]'))
            if (expandedElements.length > 0) expandedElements.forEach(li => li.setAttribute('aria-expanded', 'false'))
            // @ts-ignore
            setTimeout(() => (clonedNode.hidden = true), this.removeElementAfterAnimationDurationMs)
          })
          clonedNode.prepend(newNavBackATag)
        }
        if (clonedNode.hasAttribute('nav-level') && +clonedNode.getAttribute('nav-level') !== 1) {
          // create new navigation-back button
          const newNavBackATag = document.createElement('a')
          const mobileNavigationName = node.previousElementSibling.querySelector('ul').getAttribute('mobile-navigation-name')
          newNavBackATag.innerHTML = /* HTML */`
        <a-icon-mdx namespace='icon-link-list-' icon-name='ChevronLeft' size='1.5em' rotate='0' class='icon-right'></a-icon-mdx>
        <span>${mobileNavigationName}</span>
        `
          newNavBackATag.classList.add('navigation-back')
          newNavBackATag.setAttribute('tabindex', '0')
          newNavBackATag.addEventListener('click', (event) => {
            // @ts-ignore
            event.currentTarget.parentNode.className = ''
            // @ts-ignore
            event.currentTarget.parentNode.previousElementSibling.className = ''
            // @ts-ignore
            event.currentTarget.parentNode.classList.add('close-right-slide')
            // @ts-ignore
            event.currentTarget.parentNode.previousElementSibling.classList.add('open-left-slide')
            // @ts-ignore
            event.currentTarget.parentNode.previousElementSibling.querySelector(this.focusElSelector)?.focus()
            // @ts-ignore
            const expandedElements = Array.from(event.currentTarget.parentNode.previousElementSibling.querySelectorAll('[aria-expanded="true"]'))
            if (expandedElements.length > 0) expandedElements.forEach(li => li.setAttribute('aria-expanded', 'false'))
          })

          clonedNode.prepend(newNavBackATag)
        }

        clonedNode.hidden = true
        section.parentElement.parentElement.parentElement.appendChild(clonedNode)
      })
      section.hidden = true
    })
    
    setTimeout(() => {this.addSubNavigationHeadings()}, 100) // update headings after DOM is ready

    setTimeout(() => {
      let menuIconElement = null
      if ((menuIconElement = this.getRootNode().host?.shadowRoot?.querySelector('header > a-menu-icon'))) {
        menuIconElement.addEventListener('click', (event) => {
          if (event.currentTarget.getAttribute('aria-expanded') === 'true') {
            this.root.querySelector('nav')?.setAttribute('aria-expanded', 'true')
          } else {
            this.root.querySelector('nav')?.setAttribute('aria-expanded', 'false')
            menuIconElement.previousElementSibling.classList.remove('open')
          }
        })
      }
    }, 500)
  }

  setLoadCustomElementsAttribute (template) {
    const templateContent = template.content
    const notDefined = Array.from(templateContent.querySelectorAll(':not(:defined)')).filter(node => !customElements.get(node.tagName.toLowerCase()))
    if (notDefined?.length) {
      if (document.body.hasAttribute(this.getAttribute('load-custom-elements') || 'load-custom-elements')) {
        this.dispatchEvent(new CustomEvent(this.getAttribute('load-custom-elements') || 'load-custom-elements', {
          detail: {
            nodes: notDefined
          },
          bubbles: true,
          cancelable: true,
          composed: true
        }))
      } else {
        console.error(
          'There are :not(:defined) web components in the template. You must load through wc-config or manually:',
          notDefined,
          this
        )
      }
    }
  }
}
