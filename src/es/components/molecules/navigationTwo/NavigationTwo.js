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
    this.useHoverListener = this.hasAttribute('use-hover-listener')
    this.animationDurationMs = this.getAttribute("animation-duration") || 300
    this.removeElementAfterAnimationDurationMs = this.animationDurationMs + 50


    this.resizeListener = event => {
      let oldIsDesktopValue = this.isDesktop

      if (this.hasAttribute('no-scroll')) {
        this.classList.remove(this.getAttribute('no-scroll') || 'no-scroll')
        this.nav.setAttribute('aria-expanded', this.getMedia() === 'desktop' ? 'true' : 'false')
      }

      // header removes no-scroll at body on resize, which must be avoided if navigation is open
      if (this.hasAttribute('no-scroll') && this.isDesktop === (this.isDesktop = this.checkMedia('desktop')) && ((this.isDesktop && this.classList.contains('open')) || (this.isDesktop && this.root.querySelector('li.open')))) {
        this.setScrollOnBody(!this.classList.contains('open'), event)
      }

      // by mobile resize it closes the open flyout nav, clears the flyout state and set the scroll available on the body
      if (!this.isDesktop) {
        this.nav.setAttribute('aria-expanded', 'true')
        if (this.getRootNode().host.shadowRoot && this.getRootNode().host.shadowRoot.querySelector("header") && this.getRootNode().host.shadowRoot.querySelector("header").classList.contains("open")) {
          this.getRootNode().host.shadowRoot.querySelector("a-menu-icon").click()
          this.setScrollOnBody(true, event)
        }
        this.hideAndClearMobileSubNavigation()
      }

      // clear desktop flyout state (hover, scrollPosition, etc) if closes
      if (this.isDesktop) this.hideAndClearDesktopSubNavigation()

      // make some change on html to be mobile or desktop layout compatible if the screen-width changes between mobile and desktop
      if (oldIsDesktopValue !== this.isDesktop) this.htmlReBuilderByLayoutChange()
    }

    this.selfClickListener = (event) => {
      if (this.focusLostClose) {
        if (this.hasAttribute('focus-lost-close-mobile')) {
          if (this.hasAttribute('no-scroll')) {
            this.setScrollOnBody(false, event)
            if (this.getMedia() !== 'desktop') this.nav.setAttribute('aria-expanded', 'false')
          }
        }
      }

      if (this.isDesktop) this.hideAndClearDesktopSubNavigation()
      if (!this.isDesktop) this.hideAndClearMobileSubNavigation()
    }

    this.aLinkClickListener = event => {
      if (event.currentTarget) {
        // If desktop use-hover-listener attribute exists
        if (this.isDesktop && this.useHoverListener) {
          if (!event.currentTarget.getAttribute('href') || event.currentTarget.getAttribute('href') === '#') {
            const isOpen = event.currentTarget.classList.contains('open')
            event.preventDefault()
            if (this.focusLostClose) {
              event.stopPropagation()
              if (this.hasAttribute('no-scroll')) {
                this.setScrollOnBody(true, event)
              }
            }
            // clean state between main li switching
            if (event.currentTarget.parentNode && event.currentTarget.parentNode.parentNode && event.currentTarget.parentNode.parentNode.parentNode && event.currentTarget.parentNode.parentNode.parentNode.tagName === 'NAV') {
              event.currentTarget.parentNode.parentNode.classList[isOpen ? 'remove' : 'add']('open')
              event.currentTarget.parentNode.setAttribute('aria-expanded', 'true')
              event.currentTarget.parentNode.setAttribute('aria-controls', 'nav-level-1')
              this.hideAndClearDesktopSubNavigation()
            }

            // remove all the previous open class by other a tag
            Array.from(event.currentTarget.parentNode.parentNode.querySelectorAll('.open')).forEach(el => {
              el.classList.remove('open')
            })

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
            setTimeout(() => this.removeAttribute('style'), 3000)
            self.open(event.currentTarget.getAttribute('href'), event.currentTarget.getAttribute('target') || '_self')
          }
        }
        // If use-hover-listener attribute NOT exists 
        else if (this.isDesktop && !this.useHoverListener) {
          if (!event.currentTarget.getAttribute('href') || event.currentTarget.getAttribute('href') === '#') {
            const isOpen = event.currentTarget.classList.contains('open')
            event.preventDefault()
            if (this.focusLostClose) {
              event.stopPropagation()
              if (this.hasAttribute('focus-lost-close-mobile') && this.hasAttribute('no-scroll')) {
                this.setScrollOnBody(true, event)
              }
            }
            // clean state between main li switching
            if (event.currentTarget.parentNode && event.currentTarget.parentNode.parentNode && event.currentTarget.parentNode.parentNode.parentNode && event.currentTarget.parentNode.parentNode.parentNode.tagName === 'NAV') {
              event.currentTarget.parentNode.parentNode.classList[isOpen ? 'remove' : 'add']('open')
              event.currentTarget.parentNode.setAttribute('aria-expanded', 'true')
              event.currentTarget.parentNode.setAttribute('aria-controls', 'nav-level-1')
              this.hideAndClearDesktopSubNavigation()
            }

            // remove all the previous open class by other a tag
            Array.from(event.currentTarget.parentNode.parentNode.querySelectorAll('.open')).forEach(el => {
              el.classList.remove('open')
            })

            event.currentTarget.parentNode.classList[isOpen ? 'remove' : 'add']('open')

            // Click event logic
            if (event.currentTarget.parentNode.hasAttribute("sub-nav")) {
              let wrapperDiv = event.currentTarget.parentElement.parentElement.parentElement
              let wrapperDivNextSiblingDiv = wrapperDiv.nextSibling
              let wrapperDivNextSiblingDivUls = Array.from(wrapperDivNextSiblingDiv.querySelectorAll("ul"))
              let wrapperDivSecondNextSiblingDiv = null
              let wrapperDivSecondNextSiblingDivUls = null
              if (wrapperDivNextSiblingDiv.nextSibling) wrapperDivSecondNextSiblingDiv = wrapperDivNextSiblingDiv.nextSibling
              if (wrapperDivSecondNextSiblingDiv && Array.from(wrapperDivSecondNextSiblingDiv.querySelectorAll("ul")).length) wrapperDivSecondNextSiblingDivUls = Array.from(wrapperDivSecondNextSiblingDiv.querySelectorAll("ul"))


              Array.from(wrapperDiv.querySelectorAll("li")).forEach(li => {
                if (li.hasAttribute("aria-expanded")) li.setAttribute("aria-expanded", "false")
                li.classList.remove("hover-active")
              })
              event.currentTarget.parentNode.setAttribute("aria-expanded", "true")
              event.currentTarget.parentNode.classList.add("hover-active")
              let subUl = null
              if (wrapperDivNextSiblingDiv && wrapperDivNextSiblingDivUls.length && (subUl = wrapperDivNextSiblingDivUls.find(ul => ul.getAttribute("sub-nav-id") === event.currentTarget.parentNode.getAttribute("sub-nav")))) {
                wrapperDivNextSiblingDiv.hidden = true
                wrapperDivNextSiblingDivUls.forEach(ul => {
                  ul.style.display = "none"
                  Array.from(ul.querySelectorAll("li")).forEach(li => {
                    if (li.hasAttribute("aria-expanded")) li.setAttribute("aria-expanded", "false")
                    li.classList.remove("hover-active")
                  })
                })
                subUl.parentElement.hidden = false
                subUl.style.display = "block"
                subUl.scrollTo(0, 0)
                if (wrapperDivSecondNextSiblingDiv) wrapperDivSecondNextSiblingDiv.hidden = true
                if (wrapperDivSecondNextSiblingDivUls) wrapperDivSecondNextSiblingDivUls.forEach(ul => ul.style.display = "none")
              } else {
                return
              }


            }
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
        // if mobile
        else {
          if (!event.currentTarget.getAttribute('href') || event.currentTarget.getAttribute('href') === '#') {
            event.preventDefault()
            if (this.focusLostClose) {
              event.stopPropagation()
              if (this.hasAttribute('focus-lost-close-mobile') && this.hasAttribute('no-scroll')) {
                this.setScrollOnBody(true, event)
              }
            }
            // set aria expended attributes
            Array.from(event.currentTarget.parentNode.parentNode.parentNode.querySelectorAll("li")).forEach(li => {
              if (li.hasAttribute("sub-nav")) li.setAttribute("aria-expanded", "false")
            })

            // clean state between main li switching
            if (event.currentTarget.parentNode && event.currentTarget.parentNode.parentNode && event.currentTarget.parentNode.parentNode.parentNode && event.currentTarget.parentNode.parentNode.parentNode.tagName === 'NAV') {
              // hide all subUl height to avoid large height of nav tag
              let subNavigationDivs = Array.from(event.currentTarget.parentNode.parentNode.parentNode.querySelectorAll("div[nav-level]")).filter(div => +div.getAttribute("nav-level") > 1)
              subNavigationDivs.forEach(subNavDiv => {
                let subNavUls = Array.from(subNavDiv.querySelectorAll("ul"))
                subNavUls.forEach(ul => ul.style.display = "none")
              })
              event.currentTarget.parentNode.setAttribute('aria-expanded', 'true')

              // hide main navigation
              let sectionChildren = Array.from(event.currentTarget.parentNode.querySelector("section").children)
              sectionChildren.forEach((node) => {
                let currentNode = node.cloneNode(true)
                Array.from(currentNode.querySelectorAll("a")).forEach(a => a.addEventListener('click', this.aLinkClickListener))
                if (!node.getAttribute('slot')) event.currentTarget.parentNode.parentNode.parentNode.appendChild(currentNode)
              })

              event.currentTarget.parentNode.parentNode.classList.add("close-left-slide")

              // create new a tag with text of li which navigates one level up
              if (event.currentTarget.parentNode.parentNode.parentNode.querySelector("nav > div[nav-level='1']").querySelector("div > a")) {
                let currentNavBackATag = event.currentTarget.parentNode.parentNode.parentNode.querySelector("nav > div[nav-level='1']").querySelector("div > a")
                currentNavBackATag.parentElement.removeChild(currentNavBackATag)
              }

              let navBackATag = document.createElement("a")
              let mobileNavigationName = event.currentTarget.parentNode.parentNode.getAttribute("mobile-navigation-name")
              navBackATag.innerHTML = /* HTML */`
              <a-icon-mdx namespace="icon-link-list-" icon-name="ChevronLeft" color="red" size="1.5em" rotate="0" class="icon-right"></a-icon-mdx>
              <span>${mobileNavigationName}</span>
              `
              navBackATag.classList.add("navigation-back")
              navBackATag.addEventListener('click', (event) => {
                // @ts-ignore
                event.currentTarget.parentNode.classList.remove("open-right-slide")
                // @ts-ignore
                event.currentTarget.parentNode.previousElementSibling.scrollTo(0, 0)
                // @ts-ignore
                event.currentTarget.parentNode.previousElementSibling.classList.remove("close-left-slide")
                // @ts-ignore
                event.currentTarget.parentNode.classList.add("close-right-slide")
                // @ts-ignore
                event.currentTarget.parentNode.previousElementSibling.classList.add("open-left-slide")
                // remove subNav divs from next to ul 
                // @ts-ignore
                let currentSubNavs = Array.from(event.currentTarget.parentNode.parentNode.querySelectorAll('nav > div[nav-level]'))
                // remove element after animation is done => TODO create global animation duration variable
                setTimeout(() => currentSubNavs.forEach(subNav => subNav.parentNode.removeChild(subNav)), this.removeElementAfterAnimationDurationMs)
              })
              // add click eventlistener which bring back the main navigation
              event.currentTarget.parentNode.parentNode.parentNode.querySelector("nav > div[nav-level='1']").prepend(navBackATag)
              event.currentTarget.parentNode.parentNode.classList.remove("open-left-slide")
              event.currentTarget.parentNode.parentNode.parentNode.querySelector("nav > div[nav-level='1']").classList.add("open-right-slide")
            }

            // Click event logic
            if (event.currentTarget.parentNode.hasAttribute("sub-nav")) {
              let wrapperDiv = event.currentTarget.parentElement.parentElement.parentElement
              let wrapperDivNextSiblingDiv = wrapperDiv.nextSibling
              let wrapperDivNextSiblingDivUls = Array.from(wrapperDivNextSiblingDiv.querySelectorAll("ul"))
              let wrapperDivSecondNextSiblingDiv = null
              let wrapperDivSecondNextSiblingDivUls = null
              if (wrapperDivNextSiblingDiv.nextSibling) wrapperDivSecondNextSiblingDiv = wrapperDivNextSiblingDiv.nextSibling
              if (wrapperDivSecondNextSiblingDiv && Array.from(wrapperDivSecondNextSiblingDiv.querySelectorAll("ul")).length) wrapperDivSecondNextSiblingDivUls = Array.from(wrapperDivSecondNextSiblingDiv.querySelectorAll("ul"))

              event.currentTarget.parentNode.setAttribute("aria-expanded", "true")
              let subUl = null
              if (wrapperDivNextSiblingDiv && wrapperDivNextSiblingDivUls.length && (subUl = wrapperDivNextSiblingDivUls.find(ul => ul.getAttribute("sub-nav-id") === event.currentTarget.parentNode.getAttribute("sub-nav")))) {
                wrapperDivNextSiblingDivUls.forEach(ul => {
                  ul.style.display = "none"
                })

                if (wrapperDivNextSiblingDiv) {
                  if (wrapperDivNextSiblingDiv.querySelector("div > a")) {
                    let currentNavBackATag = wrapperDivNextSiblingDiv.querySelector("div > a")
                    currentNavBackATag.parentElement.removeChild(currentNavBackATag)
                  }
                  let navBackATag2 = document.createElement("a")
                  let mobileNavigationName = event.currentTarget.parentNode.parentNode.getAttribute("mobile-navigation-name")
                  navBackATag2.innerHTML = /* HTML */`
                  <a-icon-mdx namespace="icon-link-list-" icon-name="ChevronLeft" size="1.5em" rotate="0" class="icon-right"></a-icon-mdx>
                  <span>${mobileNavigationName}</span>
                  `
                  navBackATag2.classList.add("navigation-back")

                  navBackATag2.addEventListener('click', (event) => {

                    // @ts-ignore
                    event.currentTarget.parentNode.className = ""
                    // @ts-ignore
                    event.currentTarget.parentNode.previousElementSibling.className = ""
                    // @ts-ignore
                    event.currentTarget.parentNode.classList.add("close-right-slide")
                    // @ts-ignore
                    event.currentTarget.parentNode.previousElementSibling.classList.add("open-left-slide")

                    // find uls and add display none to all
                    setTimeout(() => {
                      wrapperDivNextSiblingDivUls.forEach(ul => {
                        ul.scrollTo(0, 0)
                        ul.style.display = "none"
                      })
                    }, this.removeElementAfterAnimationDurationMs)
                  })

                  subUl.parentElement.prepend(navBackATag2)
                }
                setTimeout(() => {
                  wrapperDiv.scrollTo(0, 0)
                }, this.removeElementAfterAnimationDurationMs)
                wrapperDivNextSiblingDiv.scrollTo(0, 0)
                subUl.style.display = "block"
                wrapperDiv.className = ""
                wrapperDiv.classList.add("close-left-slide")
                wrapperDivNextSiblingDiv.className = ""
                wrapperDivNextSiblingDiv.classList.add("open-right-slide")
                // i think we dont need at all this line of code
                if (wrapperDivSecondNextSiblingDivUls) wrapperDivSecondNextSiblingDivUls.forEach(ul => ul.style.display = "none")
              } else {
                return
              }


            }
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
      --nav-level-item-default-height: 2.75em;
      --nav-level-item-default-margin: 2px;
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
    :host > nav > ul > li.open > a > span {
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
      --justify-content: start;
      --align-items: start;
      --ul-padding-left: 0;
      --show: slideInFromTop 0.2s ease;
      overflow: hidden;
    }
    :host > nav > ul > li.open > o-nav-wrapper {
      display: flex !important;
    }
    :host > nav > ul > li > o-nav-wrapper > section {
      --gap: 1.25em;
     padding: 2em 0 1.5em 0;
    }
    :host > nav > ul > li > o-nav-wrapper > section > div {
      width: calc(calc(100% - 2 * var(--gap)) / 3) !important;
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
    :host > nav > ul > li > o-nav-wrapper > section .close-icon {
      position: absolute;
      right: 0.25em;
      top: 0.25em;
      width: auto !important;
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

    @media only screen and (min-height: 701px) {
      :host > nav > ul > li > o-nav-wrapper {
        max-height: var(--main-wrapper-max-height, 70vh);
      }
    }

    @media only screen and (max-height: 700px) {
      :host > nav > ul > li > o-nav-wrapper {
        max-height: 60vh;
      }
    }

    @media only screen and (max-height: 500px) {
      :host > nav > ul > li > o-nav-wrapper {
        max-height: 50vh;
      }
    }




    /* Mobile layout */
    @media only screen and (max-width: _max-width_) {
      :host {
        --ul-li-padding-left: 0;
      }

      :host .close-left-slide {
        animation: closeLeft ${this.animationDurationMs + 'ms'} ease-in-out forwards;
      }

      :host .open-left-slide {
        animation: openLeft ${this.animationDurationMs + 'ms'} ease-in-out forwards;
      }

      :host .close-right-slide {
        animation: closeRight ${this.animationDurationMs + 'ms'} ease-in-out forwards;
      }

      :host .open-right-slide {
        animation: openRight ${this.animationDurationMs + 'ms'} ease-in-out forwards;
      }

      :host .navigation-back {
        display: flex;
        width: fit-content;
        padding: var(--content-spacing-mobile);
        color: #262626;
        font-weight: 500;
        margin:0;
      }

      :host .navigation-back a-icon-mdx {
        --icon-link-list-color: #262626;
      }

      :host li ks-m-nav-level-item {
        --nav-level-item-default-height: 3.25em;
        --nav-level-item-default-padding: 0 0.75em 0 0;
        --nav-level-item-default-margin: 2px 0;
        --nav-level-item-default-hover-background-color: transparent;

      }

      :host li.list-title {
        padding: 1em 0;
      }

      :host li.list-title a {
        font-weight: 500;
        font-size: 1.1em;
      }

      :host li.list-title a span {
        font-weight: 300;
        font-size: 0.8em;
        color: #262626;
      }


      :host > nav {
        position: relative;
        height: 90vh;
        width: 100vw;
        overflow-x: visible;
        overflow-y: hidden;
      }

      :host > nav > ul {
        position: absolute;
        display: block;
        border-top: 1px solid #E0E0E0;
        width: 100vw;
        height: 85vh;
        overflow: auto;
        --flex-direction:column;
        --navigation-klubschule-a-color: var(--a-color);
        --navigation-klubschule-align-items: start;
        --navigation-klubschule-padding-no-scroll: 1rem 0 0 0;
      }

      :host > nav > ul > li > a:hover > span {
        border-bottom: none;
      }

      :host > nav > div {
        position: absolute;
        border-top: 1px solid #E0E0E0;
        margin-top: 1em;
        width: 100vw;
        right: -100vw;
        overflow: auto;
        height: 85vh;
      }

      :host > nav > ul.open {
        margin: 1em 0;
      }

      :host > nav > ul > li {
        width: 100%;
        margin: 2px 0;
        height: 3em;
      }

      :host > nav > ul > li > a {
        display: flex;
        justify-content: space-between;
        margin: 0;
        font-weight: 500;
      }

      :host > nav > ul > li > a > span {
       padding: 0;
       color: #262626;
      }
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

      @keyframes openRight {
        0% {right: -100vw}
        100% {right: 0}
      }

      @keyframes closeRight {
        0% {right: 0}
        100% {right: -100vw}
      }

      @keyframes closeLeft {
        0% {right: 0}
        100% { right: 100vw}
      }

      @keyframes openLeft {
        0% {right: 100vw}
        100% { right: 0}
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
   * @return {Promise<void>|void}
   */
  renderHTML(clonedNav) {
    this.nav = clonedNav || this.root.querySelector('nav') || document.createElement('nav')
    this.nav.setAttribute('aria-labelledby', 'hamburger')
    this.nav.setAttribute('aria-expanded', this.getMedia() === 'desktop' ? 'true' : 'false')
    Array.from(this.root.children).forEach(node => {
      if (node.getAttribute('slot') || node.nodeName === 'STYLE' || node.tagName === 'NAV') return false
      this.nav.appendChild(node)
    })
    this.html = this.nav
    if (this.isDesktop) {
      return this.fetchModules([
        {
          path: `${this.importMetaUrl}'../../../../organisms/wrapper/Wrapper.js`,
          name: this.getAttribute('o-nav-wrapper') || 'o-nav-wrapper'
        }
      ]).then(children => {
        Array.from(this.root.querySelectorAll('a')).forEach(a => {
          a.addEventListener('click', this.aLinkClickListener)
        })
        Array.from(this.root.querySelectorAll('section')).forEach((section, i) => {
          const wrapper = new children[0].constructorClass({ mode: 'false', mobileBreakpoint: this.mobileBreakpoint })
          // eslint-disable-line
          wrapper.setAttribute('id', `nav-section-${i}`)
          const sectionChildren = Array.from(section.children)
          sectionChildren.forEach((node) => {
            if (!node.getAttribute('slot')) wrapper.root.appendChild(node)
          })
          section.replaceWith(wrapper)

          // add close icon to all flyout
          let closeIconElement = document.createElement("a")
          closeIconElement.innerHTML = /* HTML */`
          <a-icon-mdx namespace="icon-link-list-" icon-name="X" size="1.5em" rotate="0" class="icon-right"></a-icon-mdx>
          `
          closeIconElement.classList.add("close-icon")
          wrapper.querySelector("section").appendChild(closeIconElement)

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

          // add subUl id based on sub-nav-id to have aria-controls connection
          let subUlElements = Array.from(wrapper.querySelectorAll("ul")).filter(ul => ul.hasAttribute("sub-nav-id"))
          subUlElements.forEach(ul => ul.setAttribute("id", `${ul.getAttribute('sub-nav-id')}`))

          // Add listener if there is an attribute on this element
          let subLiElements = Array.from(wrapper.querySelectorAll("li")).filter(li => li.querySelector("ks-m-nav-level-item"))
          subLiElements.forEach(li => {
            // add aria attributes to lis where needed
            if (li.hasAttribute("sub-nav")) {
              li.setAttribute("aria-expanded", "false")
              li.setAttribute("aria-controls", `${li.getAttribute('sub-nav')}`)
            }
            // add hover listener when needed
            if (this.useHoverListener) {
              li.addEventListener("mouseenter", this.subLiHoverListener)
              li.currentWrapper = wrapper
            }
          })
        })
        this.html = this.style
      })
    } else {
      Array.from(this.root.querySelectorAll('nav > ul > li > a')).forEach(a => a.addEventListener('click', this.aLinkClickListener))

      // add list-item-element
      Array.from(this.root.querySelectorAll('nav > ul > li')).forEach((mainLi, i) => {
        let currentATag
        mainLi.setAttribute("aria-expanded", "false")
        mainLi.setAttribute("aria-controls", `nav-level-${i + 1}`)
        if ((currentATag = mainLi.querySelector("a")) && (!currentATag.hasAttribute("href") || currentATag.getAttribute("href") === "" || currentATag.getAttribute("href") === "#"))
          mainLi.querySelector("a").insertAdjacentHTML('beforeend', /* html*/`
          <a-icon-mdx namespace="icon-link-list-" icon-name="ChevronRight" size="1.5em" rotate="0" class="icon-right"></a-icon-mdx>
          ` );

        // Add class for title li a element
        let subTitleLiTags = Array.from(mainLi.querySelectorAll("li")).filter(li => !li.querySelector("ks-m-nav-level-item"))
        subTitleLiTags.forEach(li => li.classList.add("list-title"))
      })

      // extract section element
      Array.from(this.root.querySelectorAll('section')).forEach((section, i) => {
        section.hidden = true
      })

      this.html = this.style
    }
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

  hideAndClearDesktopSubNavigation() {
    let navWrappers = Array.from(this.root.querySelectorAll("o-nav-wrapper"))
    navWrappers.forEach(wrapper => {
      let firstNavigationDiv = wrapper.querySelector("div[nav-level='1']")
      let subNavigationDivs = Array.from(wrapper.querySelectorAll("div[nav-level]")).filter(div => +div.getAttribute("nav-level") > 1)
      Array.from(wrapper.querySelectorAll("ul")).forEach(ul => ul.scrollTo(0, 0))
      Array.from(firstNavigationDiv.querySelectorAll("li")).forEach(li => li.classList.remove("hover-active"))
      if (subNavigationDivs.length) {
        subNavigationDivs.forEach(subNav => {
          subNav.hidden = true
        })
      }
    })

    // set the aria attributes back to default
    if (this.nav.getAttribute('aria-expanded') === 'true') {
      Array.from(this.root.querySelectorAll('li.open')).forEach(li => {
        li.classList.remove('open')
        if (li.hasAttribute("aria-expanded")) li.setAttribute("aria-expanded", "false")
        if (li.parentElement) {
          li.parentElement.classList.remove('open')
        }
      })
    }
  }

  hideAndClearMobileSubNavigation() {
    const navElementChildren = Array.from(this.root.querySelector("nav").children)
    if (this.getAttribute("aria-expanded") === "false" && navElementChildren.length) {
      setTimeout(() => {
        navElementChildren.forEach(childEl => {
          if (childEl.tagName === 'UL') {
            childEl.classList.remove("close-left-slide")
          }
          if (childEl.hasAttribute("nav-level") && childEl.parentNode) {
            childEl.parentNode.removeChild(childEl)
          }
        })
      }, this.removeElementAfterAnimationDurationMs)
    }
  }

  htmlReBuilderByLayoutChange() {
    let currentNav = this.root.querySelector("nav")
    if (this.isDesktop) {
      // set nav element from mobile to desktop compatible
      let mainATags = Array.from(currentNav.querySelectorAll("nav > ul > li > a"))
      if (mainATags.length > 0) {
        mainATags.forEach(a => {
          let aTagChildren = Array.from(a.children)
          let aTagMDXIcon = aTagChildren?.find(child => child.tagName === "A-ICON-MDX")
          if (aTagChildren.length && aTagMDXIcon) aTagMDXIcon.parentElement.removeChild(aTagMDXIcon)
        })
      }
    } else {
      // set nav from desktop to mobile compatible
      let desktopOWrappers = Array.from(currentNav.querySelectorAll("o-nav-wrapper"))
      if (desktopOWrappers.length > 0) {
        desktopOWrappers.forEach(wrapper => {
          // remove close icon
          let closeIcon
          if (closeIcon = wrapper.querySelector("section a.close-icon")) {
            closeIcon.parentElement.removeChild(closeIcon)
          }

          // put section outside of o nav wrapper
          let wrapperSection
          if (wrapperSection = wrapper.querySelector("section")) {
            let subNavigationDivs = Array.from(wrapperSection.querySelectorAll("div[nav-level]"))
            if (subNavigationDivs.length > 0) {
              subNavigationDivs.forEach(div => div.hidden = false)
            }
            wrapper.parentElement.appendChild(wrapperSection)
            wrapper.parentElement.removeChild(wrapper)
          }
        })
      }
    }
    this.setFocusLostClickBehavior()
    this.renderHTML(currentNav)
  }

  setScrollOnBody(isScrollOnBodyEnabled, event) {
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

  getMedia() {
    return self.matchMedia(`(min-width: calc(${this.mobileBreakpoint} + 1px))`).matches ? 'desktop' : 'mobile'
  }
}
