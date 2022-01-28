// @ts-check
import { Shadow } from '../prototypes/Shadow.js'

/* global self */
/* global Link */
/* global Arrow */
/* global customElements */
/* global CustomEvent */

/**
 * Navigation hosts uls
 * Example at: /src/es/components/pages/Home.html
 * As a molecule, this component shall hold Atoms
 *
 * @export
 * @class Navigation
 * @type {CustomElementConstructor}
 * @attribute {
 *  {boolean} [hover=false]
 *  {boolean} [hit-area=true] this lets you define a hit-area of your link, to avoid too large focus (hit-area) by fonts too large line-height, which can't be overwritten with css: https://github.com/mits-gossau/web-components-cms-template/issues/53
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
export default class Navigation extends Shadow() {
  constructor (...args) {
    super(...args)

    this.nav = document.createElement('nav')
    this.hidden = true
    Array.from(this.root.children).forEach(node => {
      if (node.getAttribute('slot') || node.nodeName === 'STYLE') return false
      this.nav.appendChild(node)
    })
    this.root.appendChild(this.nav)
  }

  connectedCallback () {
    if (this.shouldComponentRenderCSS()) this.renderCSS()
    if (this.shouldComponentRenderHTML()) this.renderHTML()
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
    return this.hidden
  }

  /**
   * renders the m-navigation css
   *
   * @return {void}
   */
  renderCSS () {
    const firstLevelCount = this.root.querySelectorAll('nav > ul > li').length
    this.css = /* css */`
      :host{
        color: black;
        overscroll-behavior: contain;
      }
      :host a-link {
        --padding: var(--a-link-content-spacing, 14px 10px);
        --font-size: var(--a-link-font-size, 1rem);
        --font-weight: var(--a-link-font-weight);
        --line-height: var(--a-link-line-height);
        --text-transform: var(--a-link-text-transform);
        font-family: var(--a-link-font-family);
        font-weight: var(--a-font-weight, var(--font-weight, normal));
      }
      :host(.${this.getAttribute('no-scroll') || 'no-scroll'}) a-link {
        --color: var(--a-link-color-${this.getAttribute('no-scroll') || 'no-scroll'});
        --padding: var(--a-link-content-spacing-${this.getAttribute('no-scroll') || 'no-scroll'}, 14px 10px);
        --font-size: var(--a-link-font-size-${this.getAttribute('no-scroll') || 'no-scroll'}, 1rem);
        --font-weight: var(--a-link-font-weight-${this.getAttribute('no-scroll') || 'no-scroll'});
        --line-height: var(--a-link-line-height-${this.getAttribute('no-scroll') || 'no-scroll'});
      }
      :host(.${this.getAttribute('no-scroll') || 'no-scroll'}) > nav > ul li ul a-link {
        --font-size: var(--a-link-second-level-font-size, 1rem);
        --font-weight: var(--a-link-second-level-font-weight, var(--a-link-font-weight));
        --line-height: var(--a-link-second-level-line-height);
        font-family: var(--a-link-second-level-font-family);
        font-weight: var(--a-font-weight, var(--font-weight, normal));
      }
      ${(this.getAttribute('hover') === 'true' &&
      `:host > nav > ul li:hover ul a-link,
      :host > nav > ul li ul:hover a-link,`) || ''}
      :host > nav > ul li a-link.open ~ ul a-link {
        --font-size: var(--a-link-second-level-font-size-${this.getAttribute('no-scroll') || 'no-scroll'}, 1rem);
        --font-weight: var(--a-link-second-level-font-weight-${this.getAttribute('no-scroll') || 'no-scroll'}, var(--a-link-font-weight-${this.getAttribute('no-scroll') || 'no-scroll'}));
        --line-height: var(--a-link-second-level-line-height-${this.getAttribute('no-scroll') || 'no-scroll'});
      }
      :host ul{
        background-color: var(--background-color, black);
        list-style: var(--list-style, none);
        margin: 0;
        padding: 0;
        transition: var(--transition, all 0.2s ease);
      }
      :host(.${this.getAttribute('no-scroll') || 'no-scroll'}) ul {
        background-color: var(--background-color-${this.getAttribute('no-scroll') || 'no-scroll'}, var(--background-color, black));
      }
      :host > nav > ul{
        align-items: var(--align-items, center);
        justify-content: var(--justify-content, normal);
        display: flex;
        flex-wrap: var(--flex-wrap, nowrap);
        flex-direction: var(--flex-direction, row);
        padding: var(--padding, calc(var(--content-spacing, 40px) / 2) 0);
      }
      :host(.${this.getAttribute('no-scroll') || 'no-scroll'}) > nav > ul {
        padding: var(--padding-${this.getAttribute('no-scroll') || 'no-scroll'}, calc(var(--content-spacing, 40px) / 2) 0);
      }
      :host > nav > ul > li{
        display: block;
        padding: var(--li-padding, 0 calc(var(--content-spacing, 40px) / 4));
      }
      :host > nav > ul li{
        position: relative;
        margin-bottom: var(--margin-bottom, 0);
      }
      :host > nav > ul li > a-arrow {
        display: none;
        user-select: none;
        visibility: hidden;
      }
      :host > nav > ul li ul{
        display: var(--li-ul-display, none);
        padding: var(--li-ul-padding, 0);
        border-radius: var(--li-ul-border-radius, 0);
        padding-top: calc(var(--content-spacing, 40px) / 2 + 1px);
        margin: var(--li-ul-margin);
        position: var(--li-ul-position, absolute);
        top: var(--li-ul-top, unset);
        right: var(--li-ul-right, unset);
        bottom: var(--li-ul-bottom, unset);
        left: var(--li-ul-left, unset);
        width: var(--li-ul-width, max-content);
        transition: var(--transition, all 0.2s ease);
        z-index: var(--li-ul-z-index, auto);
      }
      :host > nav > ul li:nth-child(n+${firstLevelCount / 2 + 1}) ul{
        top: var(--li-ul-top-second-half, unset);
        right: var(--li-ul-right-second-half, unset);
        bottom: var(--li-ul-bottom-second-half, unset);
        left: var(--li-ul-left-second-half, unset);
      }
      ${(this.getAttribute('hover') === 'true' &&
      `:host > nav > ul li:hover ul,
      :host > nav > ul li ul:hover,`) || ''}
      :host > nav > ul li a-link.open ~ ul {
        display: block;
        margin: var(--li-ul-margin-${this.getAttribute('no-scroll') || 'no-scroll'});
      }
      :host > nav > ul li:last-child ul{
        right: 0;
      }
      :host > nav > ul li:hover{
        cursor: pointer;
      }
      :host > nav > ul > li > ul li {
        margin-bottom: var(--li-ul-margin-bottom, 0);
      }
      :host > nav > ul li ul li {
        min-width: var(--min-width, 100px);
      }
      :host > nav > ul > li > ul > li:first-child{
        padding-top: var(--padding-top, 6px);
        border-top: var(--border-top, 1px solid) var(--hr-color, var(--color, white));
      }
      :host > nav > ul li.open > a-link, :host > nav > ul li.open > a-arrow{
        --font-family: var(--font-family-open);
        --color: var(--color-open);
      }
      @media only screen and (max-width: ${this.getAttribute('mobile-breakpoint') ? this.getAttribute('mobile-breakpoint') : self.Environment && !!self.Environment.mobileBreakpoint ? self.Environment.mobileBreakpoint : '1000px'}) {
        :host {
          --font-weight: var(--font-weight-mobile, normal);
        }
        :host a-link {
          --font-size: var(--a-link-font-size-mobile, 2rem);
          --text-align: var(--a-link-text-align-mobile, center);
          --line-height: var(--a-link-line-height-mobile, var(--a-link-line-height, var(--line-height-mobile)));
        }
        :host(.${this.getAttribute('no-scroll') || 'no-scroll'}) a-link {
          --font-size: var(--a-link-font-size-${this.getAttribute('no-scroll') || 'no-scroll'}-mobile, 2rem);
          --line-height: var(--a-link-line-height-${this.getAttribute('no-scroll') || 'no-scroll'}-mobile, var(--a-link-line-height-${this.getAttribute('no-scroll') || 'no-scroll'}, var(--line-height-mobile)));
        }
        :host(.${this.getAttribute('no-scroll') || 'no-scroll'}) > nav > ul li ul a-link {
          --font-size: var(--a-link-second-level-font-size-mobile, var(--a-link-second-level-font-size, 1rem));
        }
        ${(this.getAttribute('hover') === 'true' &&
        `:host > nav > ul li:hover ul a-link,
        :host > nav > ul li ul:hover a-link,`) || ''}
        :host > nav > ul li a-link.open ~ ul a-link {
          --font-size: var(--a-link-second-level-font-size-${this.getAttribute('no-scroll') || 'no-scroll'}-mobile, var(--a-link-second-level-font-size-${this.getAttribute('no-scroll') || 'no-scroll'}, 1rem));
        }
        :host > nav > ul{
          flex-direction: var(--flex-direction-mobile, var(--flex-direction, column));
          padding: 0;
        }
        :host > nav > ul li{
          border-top: 1px solid var(--hr-color, var(--color, white));
          display: flex;
          flex-wrap: wrap;
          justify-content: var(--justify-content-mobile, center);
          padding: 0;
          width: 100%;
          margin-bottom: var(--margin-bottom-mobile, 0);
        }
        :host > nav > ul li.open > a-link, :host > nav > ul li.open > a-arrow{
          --color: var(--a-arrow-color-hover, var(--color-hover));
        }
        :host > nav > ul li > a-link{
          flex-grow: 1;
        }
        :host > nav > ul > li:not(.no-arrow) > a-arrow {
          visibility: visible;
        }
        :host > nav > ul > li a-arrow {
          --color: var(--a-arrow-color);
          display: var(--arrow-display, 'block');
          min-height: var(--min-height-mobile, 50px);
          min-width: var(--min-width-mobile, 50px);
        }
        :host > nav > ul li ul{
          --font-weight: calc(var(--font-weight) / 2);
          padding: 0;
          position: unset;
          width: 100%;
        }
        :host > nav > ul li:hover ul,
        :host > nav > ul li:not(.open) a-link.open ~ ul,
        :host > nav > ul li ul:hover{
          display: none;
        }
        :host > nav > ul li.open ul{
          display: block;
        }
        :host > nav > ul > li > ul li {
          flex-wrap: unset;
          margin-bottom: var(--li-ul-margin-bottom-mobile, 0);
        }
        :host > nav > ul li.open > a-link, :host > nav > ul li.open > a-arrow{
          --font-family: var(--font-family-open-mobile, var(--font-family-open));
          --color: var(--color-open-mobile, var(--color-open));
        }
      }
    `
  }

  /**
   * renders the a-link html
   *
   * @param {string[]} [arrowDirections=['up', 'down']]
   * @return {void}
   */
  renderHTML (arrowDirections = ['up', 'down']) {
    this.loadChildComponents().then(children => {
      Array.from(this.root.querySelectorAll('a')).forEach(a => {
        const li = a.parentElement
        if (!li.querySelector('ul')) li.classList.add('no-arrow')
        const aLink = new children[0][1](a, { namespace: this.getAttribute('namespace') || '', namespaceFallback: this.hasAttribute('namespace-fallback') })
        aLink.setAttribute('hit-area', this.getAttribute('hit-area') || 'true')
        if (this.hasAttribute('set-active')) aLink.setAttribute('set-active', this.getAttribute('set-active'))
        if (a.classList.contains('active')) aLink.classList.add('active')
        const arrow = new children[1][1]({ namespace: this.getAttribute('namespace') || '', namespaceFallback: this.hasAttribute('namespace-fallback') })
        arrow.setAttribute('direction', arrowDirections[1])
        const arrowClickListener = event => {
          if (this.hasAttribute('focus-lost-close-mobile')) Array.from(this.root.querySelectorAll('li.open')).forEach(li => li.classList.remove('open'))
          li.classList.toggle('open')
          arrow.setAttribute('direction', li.classList.contains('open') ? arrowDirections[0] : arrowDirections[1])
        }
        arrow.addEventListener('click', arrowClickListener)
        aLink.addEventListener('click', event => {
          if (event.target) {
            arrowClickListener()
            let a = null
            if (event.target.root && (a = event.target.root.querySelector('a'))) {
              if (!a.getAttribute('href') || a.getAttribute('href') === '#') {
                event.preventDefault()
                if (this.focusLostClose) event.stopPropagation()
                Array.from(this.root.querySelectorAll('a-link.open')).forEach(aLink => {
                  aLink.classList.remove('open')
                  let arrow
                  if (aLink.parentNode && event.target && !aLink.parentNode.classList.contains('open') && (arrow = aLink.parentNode.querySelector(`[direction=${arrowDirections[0]}]`))) arrow.setAttribute('direction', arrowDirections[1])
                })
                event.target.classList.add('open')
              } else if (a.getAttribute('href')[0] === '#') {
                this.dispatchEvent(new CustomEvent(this.getAttribute('click-anchor') || 'click-anchor', {
                  detail: {
                    selector: a.getAttribute('href')
                  },
                  bubbles: true,
                  cancelable: true,
                  composed: true
                }))
              }
            }
          }
        })
        if (this.focusLostClose) {
          self.addEventListener('click', event => {
            if (this.hasAttribute('focus-lost-close-mobile')) {
              Array.from(this.root.querySelectorAll('li.open')).forEach(li => li.classList.remove('open'))
              if (this.hasAttribute('no-scroll')) document.documentElement.classList.remove(this.getAttribute('no-scroll') || 'no-scroll')
            }
            Array.from(this.root.querySelectorAll('a-link.open')).forEach(aLink => {
              aLink.classList.remove('open')
              let arrow
              if (aLink.parentNode && event.target && !aLink.parentNode.classList.contains('open') && (arrow = aLink.parentNode.querySelector(`[direction=${arrowDirections[0]}]`))) arrow.setAttribute('direction', arrowDirections[1])
            })
          })
        }
        li.prepend(arrow)
        a.replaceWith(aLink)
        li.prepend(aLink)
      })
      this.hidden = false
    })
  }

  /**
   * fetch children when first needed
   *
   * @param {Promise<[string, CustomElementConstructor]>[]} [promises=[]]
   * @returns {Promise<[string, CustomElementConstructor][]>}
   */
  loadChildComponents (promises = []) {
    if (this.childComponentsPromise) return this.childComponentsPromise
    let linkPromise, arrowPromise
    try {
      linkPromise = Promise.resolve({ default: Link })
    } catch (error) {
      linkPromise = import('../atoms/Link.js')
    }
    try {
      arrowPromise = Promise.resolve({ default: Arrow })
    } catch (error) {
      arrowPromise = import('../atoms/Arrow.js')
    }
    return (this.childComponentsPromise = Promise.all([
      linkPromise.then(
        /** @returns {[string, CustomElementConstructor]} */
        module => ['a-link', module.default]
      ),
      arrowPromise.then(
        /** @returns {[string, CustomElementConstructor]} */
        module => ['a-arrow', module.default]
      ),
      ...promises
    ]).then(elements => {
      elements.forEach(element => {
        // don't define already existing customElements
        // @ts-ignore
        if (!customElements.get(element[0])) customElements.define(...element)
      })
      return elements
    }))
  }

  get focusLostClose () {
    return this.hasAttribute('focus-lost-close') && this.getAttribute('focus-lost-close') !== 'false'
  }
}
