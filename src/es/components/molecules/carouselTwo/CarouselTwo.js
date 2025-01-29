// @ts-check
import { Mutation } from '../../prototypes/Mutation.js'

/* global self */
/* global location */
/* global history */
/* global CustomEvent */

/**
 * https://css-tricks.com/how-to-make-a-css-only-carousel/
 * TODO: slides-per-view
 *
 * @attribute {
 * }
 * @css {
 * }
 * @type {CustomElementConstructor}
 */
export default class CarouselTwo extends Mutation() {
  constructor (options = {}, ...args) {
    super({
      importMetaUrl: import.meta.url,
      mutationObserverInit: { subtree: true, childList: true },
      ...options
    }, ...args)

    if (this.hasAttribute('open-modal')) this.setAttribute('aria-haspopup', 'true')
    // on click anchor scroll to the image with the matching id or previous/next
    this.clickListener = event => {
      let target
      if ((target = event.composedPath().find(node => typeof node.getAttribute === 'function' && node.getAttribute('href') && node.getAttribute('href').substring(0, 1) === '#'))) {
        if (!this.hasAttribute('history')) event.preventDefault()
        let sectionChild
        if ((sectionChild = this.section.querySelector(target.getAttribute('href')))) {
          this.scrollIntoView(sectionChild)
        } else if (target.getAttribute('href') === '#previous') {
          this.previous()
        } else if (target.getAttribute('href') === '#next') {
          this.next()
        }
        this.setSlideIndicator()
      }
      if (this.hasAttribute('open-modal')) {
        if (!this.hasAttribute('open')) event.stopPropagation()
        this.dispatchEvent(new CustomEvent(this.getAttribute('open-modal') || 'open-modal', {
          detail: {
            origEvent: event,
            child: this,
            btnCloseOnly: true,
            openFunc: () => this.scrollIntoView(this.section.querySelector('.active'), false, true),
            closeFunc: () => this.scrollIntoView(this.section.querySelector('.active'), false, true)
          },
          bubbles: true,
          cancelable: true,
          composed: true
        }))
      }
    }
    this.keydownTimeoutId = null
    this.keydownListener = event => {
      // @ts-ignore
      clearTimeout(this.keydownTimeoutId)
      this.keydownTimeoutId = setTimeout(() => {
        if (event.keyCode === 37) return this.previous()
        if (event.keyCode === 39) return this.next()
      }, 200)
    }
    // on focus scroll to the right element
    this.focusListener = event => {
      let target
      if ((target = event.target) && Array.from(this.section.children).includes(target)) this.scrollIntoView(target, false)
    }
    // on scroll calculate which image is shown and set its and all of its referencing href nodes the class to active
    let scrollTimeoutId = null
    const scrollTolerance = 50
    this.scrollListener = event => {
      this.section.classList.add('scrolling')
      this.clearInterval()
      clearTimeout(scrollTimeoutId)
      scrollTimeoutId = setTimeout(() => {
        let hostLeft, activeChild
        if (this.getAttribute('namespace') === 'carousel-two-teaser-' || this.getAttribute('namespace') === 'carousel-two-3-column-'
          ? (hostLeft = Math.round(this.section.getBoundingClientRect().right)) !== undefined && (activeChild = Array.from(this.section.children).find(node => {
              const nodeLeft = Math.round(node.getBoundingClientRect().right)
              const width = this.getAttribute('namespace') === 'carousel-two-3-column-' ? Math.round(node.getBoundingClientRect().width) : Math.round(node.getBoundingClientRect().width) / 2
              return hostLeft + scrollTolerance > nodeLeft && hostLeft - (scrollTolerance + width) < nodeLeft
            }))
          : (hostLeft = Math.round(this.section.getBoundingClientRect().left)) !== undefined && (activeChild =
            Array.from(this.section.children).find((node, index) => {
              const nodeLeft = Math.round(node.getBoundingClientRect().left)
              const isActiveChild = hostLeft + scrollTolerance > nodeLeft && hostLeft - scrollTolerance < nodeLeft
              if (isActiveChild) this.currentIndex = index + 1
              return isActiveChild
            }))) {
          Array.from(this.root.querySelectorAll('.active')).forEach(node => {
            node.classList.remove('active')
            node.setAttribute('aria-hidden', 'true')
          })
          activeChild.classList.add('active')
          activeChild.setAttribute('aria-hidden', 'false')
          this.dispatchEvent(new CustomEvent(this.getAttribute('carousel-changed') || 'carousel-changed', {
            detail: { node: activeChild },
            bubbles: true,
            cancelable: true,
            composed: true
          }))
          Array.from(this.root.querySelectorAll(`[href="#${activeChild.getAttribute('id')}"]`)).forEach(node => {
            if (Array.from(this.nav.children).includes(node.parentNode)) node.parentNode.classList.add('active')
            node.classList.add('active')
          })
          this.section.classList.remove('scrolling')
          this.setSlideIndicator()
          this.setInterval()
          // adjust the history
          if (this.hasAttribute('history') && !this.hasAttribute('interval') && !self.location.hash.includes(activeChild.getAttribute('id'))) {
            const url = `${self.location.href.split('#')[0]}#${activeChild.getAttribute('id')}`
            if (self.location.hash.includes('next') || self.location.hash.includes('previous')) {
              self.history.replaceState({ ...history.state, picture: activeChild.getAttribute('id'), url }, document.title, url)
            } else {
              self.history.pushState({ ...history.state, picture: activeChild.getAttribute('id'), url }, document.title, url)
            }
          }
        }
      }, 50)
    }
    // interval stuff
    this.interval = null
    // stop interval when clicking outside window eg. iframe, etc.
    this.isFocused = false
    this.blurEventListener = event => {
      this.isFocused = false
      this.setInterval()
    }
    this.focusEventListener = event => {
      this.isFocused = true
      this.clearInterval()
    }
    // browser prev/next navigation
    this.hashchangeEventListener = event => {
      let element = null
      if ((element = this.root.querySelector((event && event.detail && event.detail.selector.replace(/(.*#)(.*)$/, '#$2')) || location.hash))) this.scrollIntoView(element, false)
    }
  }

  connectedCallback () {
    super.connectedCallback()
    this.hidden = true
    const showPromises = []
    if (this.shouldRenderCSS()) showPromises.push(this.renderCSS())
    if (this.shouldRenderHTML()) showPromises.push(this.renderHTML())
    CarouselTwo.walksDownDomQueryMatchesAll(this.section, 'a-picture').concat(CarouselTwo.walksDownDomQueryMatchesAll(this.nav, 'a-picture')).forEach(picture => {
      // @ts-ignore
      if (picture && picture.hasAttribute('picture-load') && !picture.hasAttribute('loaded')) showPromises.push(new Promise(resolve => picture.addEventListener('picture-load', event => resolve(), { once: true })))
    })
    // Carousel still pops instead of appear nicely. With slow network connection it works though.
    Promise.all(showPromises).then(() => {
      this.hidden = false
      if (!this.section.classList.contains('scrolling')) {
        const activeChild = this.section.children[this.hasAttribute('active') ? Number(this.getAttribute('active')) : 0]
        this.scrollIntoView(activeChild || this.section.children[0], false)
      }
      this.setInterval()
    })
    this.addEventListener('click', this.clickListener)
    if (!this.hasAttribute('no-keydown')) document.addEventListener('keydown', this.keydownListener)
    this.section.addEventListener('scroll', this.scrollListener)
    Array.from(this.section.children).forEach(node => node.addEventListener('focus', this.focusListener))
    if (this.hasAttribute('interval')) {
      this.addEventListener('blur', this.blurEventListener)
      this.addEventListener('focus', this.focusEventListener)
    }
    if (this.hasAttribute('history') && !this.hasAttribute('interval')) self.addEventListener('hashchange', this.hashchangeEventListener)
  }

  disconnectedCallback () {
    super.disconnectedCallback()
    this.removeEventListener('click', this.clickListener)
    if (!this.hasAttribute('no-keydown')) document.removeEventListener('keydown', this.keydownListener)
    this.section.removeEventListener('scroll', this.scrollListener)
    Array.from(this.section.children).forEach(node => node.removeEventListener('focus', this.focusListener))
    if (this.hasAttribute('interval')) {
      this.removeEventListener('blur', this.blurEventListener)
      this.removeEventListener('focus', this.focusEventListener)
    }
    if (this.hasAttribute('history') && !this.hasAttribute('interval')) self.removeEventListener('hashchange', this.hashchangeEventListener)
  }

  // incase a child would manipulate itself, expl. teaser or wrapper wrapping themself with an a tag when they get an href
  mutationCallback (mutationList, observer) {
    if (mutationList[0] && mutationList[0].type === 'childList') {
      this.setAttribute('count-section-children', this.section.children.length)
      mutationList[0].addedNodes.forEach(node => {
        if (Array.from(this.section.children).includes(node)) {
          // grab the id if there was a mutation on the child being wrapped or so
          let id
          if (!node.hasAttribute('id') && node.children[0] && node.children[0].hasAttribute('id') && (id = node.children[0].getAttribute('id')).includes(this.idPefix)) {
            node.children[0].removeAttribute('id')
            node.setAttribute('id', id)
          }
          node.children[0].removeEventListener('focus', this.focusListener)
          node.addEventListener('focus', this.focusListener)
        }
      })
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
    return !this.section || !this.nav || !this.arrowNav
  }

  /**
   * renders the css
   *
   * @return {Promise<void>}
   */
  renderCSS () {
    this.css = /* css */`
      :host {
        background-color: var(--background-color, transparent);
        display: grid !important;
      }
      :host([nav-separate][nav-align-self="start"]:not([no-default-nav])) > section,
      :host([nav-separate][nav-align-self="start"]:not([no-default-nav])) > .arrow-nav {
        margin-bottom: var(--section-nav-separate-margin);
      }
      :host([nav-separate]:not([nav-align-self="start"]):not([no-default-nav])) > section,
      :host([nav-separate]:not([nav-align-self="start"]):not([no-default-nav])) > .arrow-nav {
        margin-top: var(--section-nav-separate-margin);
      }
      :host > section + div > nav {
        display: grid;
      }
      :host > section, :host > nav, :host > section + div > nav, :host > *.arrow-nav {
        grid-column: 1;
        grid-row: 1;
      }
      /* START - GRID Settings */
      ${this.hasAttribute('nav-separate')
        ? /* css */`
          ${this.getAttribute('nav-align-self') === 'start'
          ? /* css */`
              :host > section {
                grid-row: 2;
              }
              :host > *.arrow-nav {
                grid-area: 2 / 1
              }
            `
          : /* css */`
              :host > nav,
              :host > section + div > nav {
                grid-row: 2;
              }
              :host > *.arrow-nav {
                grid-area: 1 / 1
              }
            `
        }
        `
        : ''
      }
      /* END - GRID Settings */
      :host > section {
        display: flex;
        gap: var(--section-gap, normal);
        overflow: hidden;
        scroll-behavior: smooth;
        scroll-snap-type: var(--scroll-snap-type, x mandatory);
      }
      :host > section > * {
        align-items: var(--section-child-align-items, center);
        display: flex;
        flex-direction: column;
        justify-content: var(--section-child-justify-content, center);
        min-width: var(--section-child-min-width, 100%);
        max-width: var(--section-child-max-width, 100%);
        outline: none;
        scroll-snap-align: start;
        user-select: none;
      }
      :host > section > * > a-picture {
        margin: var(--section-child-a-picture-margin, auto);
      }
      :host > section > div {
        align-items: var(--section-div-align-items, var(--section-child-align-items, center));
        justify-content: var(--section-div-justify-content, var(--section-child-justify-content, space-between));
      }
      :host > section > div > div {
        padding: var(--section-div-padding, var(--nav-margin));
        width: 100%;
      }
      :host > section > div > div * {
        text-align: var(--section-div-child-text-align, left);
      }
      :host > section > div.text-align-center > div *, :host > section > div > div.text-align-center * {
        text-align: var(--section-div-child-text-align, center);
      }
      :host > section:not(.scrolling) > *:not(.active) {
        opacity: var(--section-child-opacity-not-active, 0);
      }
      :host > section + div > p {
        align-self: center;
      }
      :host > section + div {
        margin: var(--nav-margin);
        display: flex;
        flex-direction: row;
        justify-content: space-between;
      }

      :host > nav, :host > section + div > nav {
        align-items: center;
        align-self: ${this.hasAttribute('nav-separate')
        ? 'center'
        : this.hasAttribute('nav-align-self')
          ? this.getAttribute('nav-align-self')
          : 'var(--nav-align-self, end)'};
          display: ${this.hasAttribute('no-default-nav') ? 'none' : 'flex'};
          gap: var(--nav-gap);
          height: fit-content;
          margin: var(--nav-margin);
          justify-content: center;
          ${this.hasAttribute('nav-flex-wrap')
        ? 'flex-wrap: wrap;'
        : 'max-height: 20%;'}
        z-index: 2;
      }
      :host > section + div > nav {
        display: flex;
        justify-content:  ${this.hasAttribute('nav-justify-content')
        ? this.getAttribute('nav-justify-content')
        : 'var(--nav-justify-content, center)'};
      }
      :host > nav > * ,
      :host > section + div > nav > * {
        --a-margin: 0;
        padding: 0;
        margin: 0;
      }
      :host > nav > * {
        opacity: var(--nav-opacity, 0.5);
      }
      :host > section:not(.scrolling) ~ nav > *.active {
        opacity: var(--nav-opacity-active, 1);
      }
      :host > section.scrolling ~ nav > *:hover, :host > section:not(.scrolling) ~ nav > *:hover {
        opacity: var(--nav-opacity-hover, var(--nav-opacity-active, 1));
      }
      :host(.has-default-nav) > nav {
        flex-wrap: wrap;
      }
      :host(.has-default-nav) > nav > * {
        background-color: var(--nav-background-color, pink);
        border-radius: var(--nav-border-radius, 50%);
        height: var(--nav-height, 1em);
        width: var(--nav-width, 1em);
      }
      :host(.has-default-nav) > nav > *, :host > nav > *, :host(.has-default-nav) > div > nav > *, :host > div > nav > * {
        transition: all .3s ease-out !important;
      }
      :host(.has-default-nav) > section:not(.scrolling) ~ nav > *.active {
        background-color: var(--nav-background-color-active, coral);
      }
      :host(.has-default-nav) > section:not(.scrolling) ~ nav > *.active, :host > section:not(.scrolling) ~ nav > *.active {
        transform: var(--nav-transform-active, scale(1.3));
      }
      :host(.has-default-nav) > section.scrolling ~ nav > *:hover, :host(.has-default-nav) > section:not(.scrolling) ~ nav > *:hover {
        background-color: var(--nav-background-color-hover, white);
      }
      :host(.has-default-nav) > section.scrolling ~ nav > *:hover, :host(.has-default-nav) > section:not(.scrolling) ~ nav > *:hover, :host > section.scrolling ~ nav > *:hover, :host > section:not(.scrolling) ~ nav > *:hover {
        transform: var(--nav-transform-hover, scale(1.6));
        z-index: 3;
      }
      :host > section + div > #index {
        margin: var(--index-margin);
      }
      :host > section + div {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
      }
      :host > section + div > nav {
        margin-left: auto;
      }
      :host > section + div > p + nav {
        margin-left: 0;
      }
      :host(.has-default-arrow-nav) > *.arrow-nav {
        align-items: center;
        display: flex;
        margin: 0;
        justify-content: space-between;
        z-index: 1;
        font-size: var(--arrow-nav-size, 5em);
      }
      :host(.has-default-arrow-nav) > *.arrow-nav > * {
        align-items: center;
        display: flex;
        margin: var(--arrow-nav-margin, 0);
        justify-content: center;
        height: 100%;
        width: 50%;
        opacity: var(--arrow-nav-opacity, 0.5);
        transition: all .3s ease-out;
      }
      :host(.has-default-arrow-nav) > *.arrow-nav > *:hover {
        opacity: var(--arrow-nav-opacity-hover, 1);
      }
      :host(.has-default-arrow-nav) > *.arrow-nav > *:first-of-type {
        justify-content: start;
      }
      :host(.has-default-arrow-nav) > *.arrow-nav > *:last-of-type {
        justify-content: end;
      }
      :host([open-modal]) {
        position: relative;
      }
      :host([open]) > .close-btn {
        opacity: 0;
      }
      :host(:not([open])) > .close-btn {
        opacity: 1;
      }
      :host([open-modal]) > .close-btn {
        background-color: var(--close-btn-background-color, var(--color-secondary, var(--background-color)));
        border-radius: 50%;
        border: 0;
        box-sizing: border-box;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 7px;
        padding: 0.75em;
        width: 7px;
        position: absolute;
        right: calc(var(--close-btn-right, var(--content-spacing)) / 2);
        bottom: calc(var(--close-btn-bottom, var(--content-spacing)) / 2);
      }
      :host([open-modal]) > .close-btn > span {
        height: 22px;
        width: 22px;
      }
      @media only screen and (max-width: _max-width_) {
        :host > section {
          overflow-x: scroll;
        }
        :host([nav-separate][nav-align-self="start"]:not([no-default-nav])) > section,
        :host([nav-separate][nav-align-self="start"]:not([no-default-nav])) > .arrow-nav {
          margin-bottom: var(--section-nav-separate-margin-mobile, var(--section-nav-separate-margin));
        }
        :host([nav-separate]:not([nav-align-self="start"]):not([no-default-nav])) > section,
        :host([nav-separate]:not([nav-align-self="start"]):not([no-default-nav])) > .arrow-nav {
          margin-top: var(--section-nav-separate-margin-mobile, var(--section-nav-separate-margin));
        }
        :host > section > div > div {
          padding: var(--section-div-padding-mobile, var(--section-div-padding, var(--nav-margin-mobile, var(--nav-margin))));
        }
        :host > nav,
        :host > section + div {
          gap: var(--nav-gap-mobile, var(--nav-gap));
          margin: var(--nav-margin-mobile, var(--nav-margin));
        }
        :host > *.arrow-nav, :host(.has-default-arrow-nav) > *.arrow-nav {
          display: none;
        }
        :host(:not([open-modal-mobile])) {
          position: static;
        }
        :host(:not([open-modal-mobile])) > .close-btn {
          display: none;
        }
        :host([open-modal-mobile]) > .close-btn {
          right: calc(var(--close-btn-right-mobile, var(--close-btn-right, var(--content-spacing-mobile, var(--content-spacing)))) / 2);
          bottom: calc(var(--close-btn-bottom-mobile, var(--close-btn-bottom, var(--content-spacing-mobile, var(--content-spacing)))) / 2);
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
  fetchTemplate () {
    // attribute controlled styles
    const setAttributeStyles = () => {
      if (this.hasAttribute('background-color')) {
        this.setCss(/* css */`
        :host {
          background-color: ${this.getAttribute('background-color')};
        }
      `, undefined, false)
      }
      if (this.hasAttribute('nav-background-color')) {
        this.setCss(/* css */`
        :host(.has-default-nav) > nav > * {
          background-color: ${this.getAttribute('nav-background-color')};
        }
      `, undefined, false)
      }
      if (this.hasAttribute('nav-background-color-active')) {
        this.setCss(/* css */`
        :host(.has-default-nav) > section:not(.scrolling) ~ nav > *.active {
          background-color: ${this.getAttribute('nav-background-color-active')};
        }
      `, undefined, false)
      }
      if (this.hasAttribute('nav-background-color-hover')) {
        this.setCss(/* css */`
        :host(.has-default-nav) > section.scrolling ~ nav > *:hover, :host(.has-default-nav) > section:not(.scrolling) ~ nav > *:hover {
          background-color: ${this.getAttribute('nav-background-color-hover')}
        }
      `, undefined, false)
      }
      if (this.hasAttribute('arrow-nav-color')) {
        this.setCss(/* css */`
        :host > *.arrow-nav > * {
          --color: ${this.getAttribute('arrow-nav-color')}
        }
      `)
      }
      if (this.hasAttribute('arrow-nav-color-hover')) {
        this.setCss(/* css */`
        :host > *.arrow-nav > *:hover {
          --color: ${this.getAttribute('arrow-nav-color-hover')}
        }
      `)
      }
    }

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
      case 'carousel-two-default-':
        return this.fetchCSS([{
          path: `${this.importMetaUrl}./default-/default-.css`, // apply namespace since it is specific and no fallback
          namespace: false
        }, ...styles], false).then(() => setAttributeStyles())
      case 'carousel-two-thumbnail-':
        return this.fetchCSS([{
          path: `${this.importMetaUrl}./default-/default-.css`, // apply namespace since it is specific and no fallback
          namespace: false,
          replaces: [{
            pattern: '--carousel-two-default-',
            flags: 'g',
            replacement: '--carousel-two-thumbnail-'
          }]
        }, {
          path: `${this.importMetaUrl}./thumbnail-/thumbnail-.css`, // apply namespace since it is specific and no fallback
          namespace: false
        }, ...styles], false).then(() => setAttributeStyles())
      case 'carousel-two-teaser-':
        return this.fetchCSS([{
          path: `${this.importMetaUrl}./default-/default-.css`, // apply namespace since it is specific and no fallback
          namespace: false,
          replaces: [{
            pattern: '--carousel-two-default-',
            flags: 'g',
            replacement: '--carousel-two-teaser-'
          }]
        }, {
          path: `${this.importMetaUrl}./teaser-/teaser-.css`, // apply namespace since it is specific and no fallback
          namespace: false
        }, ...styles], false).then(() => setAttributeStyles())
      case 'carousel-two-seperate-nav-':
        return this.fetchCSS([{
          path: `${this.importMetaUrl}./default-/default-.css`, // apply namespace since it is specific and no fallback
          namespace: false,
          replaces: [{
            pattern: '--carousel-two-default-',
            flags: 'g',
            replacement: '--carousel-two-seperate-nav-'
          }]
        }, {
          path: `${this.importMetaUrl}./seperate-nav-/seperate-nav-.css`, // apply namespace since it is specific and no fallback
          namespace: false
        }, ...styles], false).then(() => setAttributeStyles())

      case 'carousel-two-3-column-':
        return this.fetchCSS([{
          path: `${this.importMetaUrl}./default-/default-.css`, // apply namespace since it is specific and no fallback
          namespace: false,
          replaces: [{
            pattern: '--carousel-two-default-',
            flags: 'g',
            replacement: '--carousel-two-3-column-'
          }]
        }, {
          path: `${this.importMetaUrl}./3-column-/3-column-.css`, // apply namespace since it is specific and no fallback
          namespace: false
        }, ...styles], false).then(() => setAttributeStyles())
      case 'carousel-two-image-':
        return this.fetchCSS([{
          path: `${this.importMetaUrl}./default-/default-.css`, // apply namespace since it is specific and no fallback
          namespace: false,
          replaces: [{
            pattern: '--carousel-two-default-',
            flags: 'g',
            replacement: '--carousel-two-3-column-'
          }]
        }, {
          path: `${this.importMetaUrl}./image-/image-.css`, // apply namespace since it is specific and no fallback
          namespace: false
        }, ...styles], false).then(() => setAttributeStyles())
      default:
        return this.fetchCSS(styles, false).then(() => setAttributeStyles())
    }
  }

  /**
   * renders the html
   *
   * @return {Promise<void>}
   */
  renderHTML () {
    this.section = this.root.querySelector(this.cssSelector + ' > section') || document.createElement('section')
    this.indicator = this.root.querySelector('#index')
    this.setSlideIndicator()
    this.nav = this.root.querySelector(this.cssSelector + ' > nav') || this.root.querySelector(this.cssSelector + ' section + div > nav') || document.createElement('nav')
    if (!this.hasAttribute('no-default-arrow-nav')) {
      this.arrowNav = this.root.querySelector(this.cssSelector + ' > .arrow-nav') || document.createElement('span')
      this.arrowNav.classList.add('arrow-nav')
    }
    return this.fetchModules([
      {
        path: `${this.importMetaUrl}'../../../../atoms/arrow/Arrow.js`,
        name: 'a-arrow'
      }
    ]).then(children => {
      // check item correlation between slides and navigation
      if (!this.hasAttribute('no-default-nav') && (this.section.children.length !== this.nav.children.length || this.classList.contains('has-default-nav'))) {
        this.classList.add('has-default-nav')
        // clear nav on discrepancy
        if (this.nav.childNodes.length) {
          console.warn('CarouselTwo.js has just cleared your incomplete navigation. Make sure that the nav container (navChildNodes) contains a link for each slide (sectionChildren).', { navChildNodes: this.nav.cloneNode(true).childNodes, sectionChildren: this.section.children, carousel: this })
          this.nav.innerHTML = ''
        }
        // generate default nav
        Array.from(this.section.children).forEach(node => {
          const a = document.createElement('a')
          this.nav.appendChild(a)
        })
      }
      // generate default arrows
      if (!this.hasAttribute('no-default-arrow-nav') && (this.arrowNav.children.length < 2 || this.classList.contains('has-default-arrow-nav'))) {
        this.classList.add('has-default-arrow-nav')
        // clear arrowNav on discrepancy
        if (this.arrowNav.childNodes.length) {
          console.warn('CarouselTwo.js has just cleared your incomplete arrow navigation. Make sure that the arrow nav container (arrowNavChildNodes) contains at least two children.', { arrowNavChildNodes: this.arrowNav.cloneNode(true).childNodes, carousel: this })
          this.arrowNav.innerHTML = ''
        }
        for (let i = 0; i < 2; i++) {
          const a = document.createElement('a')
          a.setAttribute('href', i === 0 ? '#previous' : '#next')
          a.setAttribute('aria-label', i === 0 ? 'previous slide' : 'next slide')
          const arrow = new children[0].constructorClass({ namespace: this.getAttribute('namespace') || '', namespaceFallback: this.hasAttribute('namespace-fallback'), mobileBreakpoint: this.mobileBreakpoint }) // eslint-disable-line
          arrow.setAttribute('direction', i === 0 ? 'left' : 'right')
          a.appendChild(arrow)
          this.arrowNav.appendChild(a)
        }
      }
      Array.from(this.section.children).forEach((node, i) => {
        // add attribute tabindex to each slide
        node.setAttribute('tabindex', '0')
        if (this.hasAttribute('no-default-nav-linking')) return
        node.setAttribute('aria-label', `slide ${i + 1}`)
        node.setAttribute('aria-hidden', 'true')
        // make sure the ids match between section and navigation nodes
        const id = `${this.id}-${i}`
        node.setAttribute('id', id)
        // set the id on the nav child
        if (this.nav.children[i]) {
          let navNode = this.nav.children[i].tagName === 'A'
            ? this.nav.children[i]
            : this.nav.children[i].querySelector('a')
              ? this.nav.children[i].querySelector('a')
              : null
          if (!navNode) {
            navNode = document.createElement('a')
            const navNodeChild = this.nav.children[i]
            navNodeChild.replaceWith(navNode)
            navNode.appendChild(navNodeChild)
          }
          navNode.setAttribute('href', `#${id}`)
          navNode.setAttribute('aria-label', `slide ${i + 1}`)
        } else if (!this.hasAttribute('no-default-nav')) {
          console.warn('CarouselTwo.js expected a nav node (navChildNode) corresponding with the slide (sectionChildNode).', { navChildNode: this.nav.children[i], sectionChildNode: node, carousel: this })
        }
      })
      this.html = [this.section, this.nav, this.arrowNav]

      // modal stuff
      if (this.hasAttribute('open-modal')) {
        this.closeBtn = document.createElement('button')
        this.closeBtn.innerHTML = `
          <span>
            <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" id="Untitled-Seite%201" viewBox="0 0 22 22" style="background-color:#ffffff00" version="1.1" xml:space="preserve" x="0px" y="0px" width="22px" height="22px">
              <g>
                <path id="Ellipse" d="M 1 11 C 1 5.4771 5.4771 1 11 1 C 16.5229 1 21 5.4771 21 11 C 21 16.5229 16.5229 21 11 21 C 5.4771 21 1 16.5229 1 11 Z" fill="#FF6600"/>
                <path d="M 15 10 L 15 12 L 7 12 L 7 10 L 15 10 Z" fill="#ffffff"/>
                <path d="M 12 15 L 10 15 L 10 7 L 12 7 L 12 15 Z" fill="#ffffff"/>
              </g>
            </svg>
          </span>
        `
        this.closeBtn.classList.add('close-btn')
        this.html = this.closeBtn
      }
    })
  }

  previous (focus) {
    if (this.getAttribute('namespace') === 'carousel-two-teaser-') return this.scrollIntoView((this.activeSlide && this.activeSlide.previousElementSibling.previousElementSibling) || Array.from(this.section.children)[this.section.children.length - 1], focus)
    if (this.getAttribute('namespace') === 'carousel-two-3-column-') {
      const jumpToLastElement = Array.from(this.section.children)[this.section.children.length - 1]
      const jumpToFirstElement = Array.from(this.section.children)[0]

      let result = jumpToLastElement
      // check if it is first Item
      if (this.activeSlide?.previousElementSibling?.previousElementSibling?.previousElementSibling) {
        const previousElement = this.activeSlide.previousElementSibling.previousElementSibling.previousElementSibling
        // jump back available nodes -> or if there are not enough jump to beginning
        result = previousElement.previousElementSibling?.previousElementSibling || previousElement?.previousElementSibling || previousElement || jumpToFirstElement
      }

      return this.scrollIntoView(
        result,
        focus
      )
    }
    return this.scrollIntoView((this.activeSlide && this.activeSlide.previousElementSibling) || Array.from(this.section.children)[this.section.children.length - 1], focus)
  }

  next (focus) {
    return this.scrollIntoView((this.activeSlide && this.activeSlide.nextElementSibling) || Array.from(this.section.children)[0], focus)
  }

  // NOTE: keep focus default on false, since this focus action can have bad side effects. Now, no other function calls this with focus=true. The original idea was, that a focus=false would set focus on the picture and for that support tab navigation.
  scrollIntoView (node, focus = false, force = false) {
    if (typeof node === 'string') node = this.section.querySelector(node) || this.section.children[0]
    if (!node) return console.warn('CarouselTwo.js can not scrollIntoView this node: ', { node, sectionChildren: this.section.children, carousel: this })
    if (force || !node.classList.contains('active')) {
      if (focus) {
        return node.focus({
          preventScroll: true,
          focusVisible: false
        })
      } // important that default keyboard works
      // node.scrollIntoView() // scrolls x and y
      this.dispatchEvent(new CustomEvent(this.getAttribute('carousel-changed') || 'carousel-changed', {
        detail: { node },
        bubbles: true,
        cancelable: true,
        composed: true
      }))

      this.section.scrollTo({
        left: this.section.scrollLeft + node.getBoundingClientRect().x - this.section.getBoundingClientRect().x,
        behavior: force ? 'instant' : 'smooth'
      })
      this.scrollListener()
    }
    return node
  }

  setInterval () {
    if (this.hasAttribute('interval') && !this.isFocused) {
      // @ts-ignore
      clearInterval(this.interval)
      this.interval = setInterval(() => this.next(false), Number(this.getAttribute('interval')))
    }
  }

  clearInterval () {
    // @ts-ignore
    if (this.hasAttribute('interval')) clearInterval(this.interval)
  }

  getRandomString () {
    if (self.crypto && self.crypto.getRandomValues && navigator.userAgent.indexOf('Safari') === -1) {
      const a = self.crypto.getRandomValues(new Uint32Array(3))
      let token = ''
      for (let i = 0, l = a.length; i < l; i++) {
        token += a[i].toString(36)
      }
      return token
    } else {
      return (Math.random() * new Date().getTime()).toString(36).replace(/\./g, '')
    }
  }

  setSlideIndicator () {
    if (this.indicator) {
      this.indicator.innerHTML = `${this.currentIndex} / ${this.section.children.length}`
    }
  }

  get activeSlide () {
    return this.section.querySelector('.active')
  }

  get id () {
    return this._id
      ? this._id
      : this.getAttribute('id')
        ? (this._id = this.getAttribute('id'))
        : (this._id = `${this.idPefix}${this.getRandomString()}`)
  }

  get idPefix () {
    return 'img-'
  }
}
