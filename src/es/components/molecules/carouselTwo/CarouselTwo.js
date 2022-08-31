// @ts-check
import { Shadow } from '../../prototypes/Shadow.js'

/**
 * https://css-tricks.com/how-to-make-a-css-only-carousel/
 * TODO: .active styling, bubbles, nav generator, arrows, aria-stuff, interval only when in intersecting (otherwise y-axis scroll)
 *
 * @attribute {
 * }
 * @css {
 * }
 * @type {CustomElementConstructor}
 */
export default class CarouselTwo extends Shadow() {
  constructor (...args) {
    super(...args)

    // on click anchor scroll to the image with the matching id or previous/next
    this.clickListener = event => {
      let target
      if ((target = event.composedPath().find(node => typeof node.getAttribute === 'function' && node.getAttribute('href')))) {
        let sectionChild
        if ((sectionChild = this.section.querySelector(target.getAttribute('href')))) {
          this.scrollIntoView(sectionChild)
        } else if (target.getAttribute('href') === '#previous') {
          this.previous()
        } else if (target.getAttribute('href') === '#next') {
          this.next()
        }
      }
    }
    // on focus scroll to the right element
    this.focusListener = event => {
      let target
      if ((target = event.target) && Array.from(this.section.children).includes(target)) this.scrollIntoView(target)
    }
    // on scroll calculate which image is shown and set its and all of its referencing href nodes the class to active
    let scrollTimeoutId = null
    const scrollTolerance = 5
    this.scrollListener = event => {
      this.section.classList.add('scrolling')
      clearTimeout(scrollTimeoutId)
      scrollTimeoutId = setTimeout(() => {
        let hostLeft, activeChild
        if ((hostLeft = Math.round(this.getBoundingClientRect().left)) && (activeChild = Array.from(this.section.children).find(node => {
          const nodeLeft = Math.round(node.getBoundingClientRect().left)
          return hostLeft + scrollTolerance > nodeLeft && hostLeft - scrollTolerance < nodeLeft
        }))) {
          Array.from(this.root.querySelectorAll('.active')).forEach(node => node.classList.remove('active'))
          activeChild.classList.add('active')
          Array.from(this.root.querySelectorAll(`[href="#${activeChild.getAttribute('id')}"]`)).forEach(node => node.classList.add('active'))
          this.section.classList.remove('scrolling')
        }
      }, 50)
    }
  }

  connectedCallback () {
    const showPromises = []
    if (this.shouldComponentRenderCSS()) showPromises.push(this.renderCSS())
    if (this.shouldComponentRenderHTML()) showPromises.push(this.renderHTML())
    Array.from(this.section.children).forEach(node => {
      if (node.hasAttribute('picture-load') && !node.hasAttribute('loaded')) showPromises.push(new Promise(resolve => node.addEventListener('picture-load', event => resolve(), { once: true })))
    })
    if (showPromises.length) {
      this.hidden = true
      Promise.all(showPromises).then(() => (this.hidden = false))
    }
    this.addEventListener('click', this.clickListener)
    this.section.addEventListener('scroll', this.scrollListener)
    Array.from(this.section.children).forEach(node => node.addEventListener('focus', this.focusListener))
  }

  disconnectedCallback () {
    this.removeEventListener('click', this.clickListener)
    this.section.removeEventListener('scroll', this.scrollListener)
    Array.from(this.section.children).forEach(node => node.removeEventListener('focus', this.focusListener))
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
    return !this.section
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
      :host > section, :host > nav {
        grid-column: 1;
        grid-row: 1;
      }
      :host > section {
        display: flex;
        overflow: hidden;
        scroll-behavior: smooth;
        scroll-snap-type: x mandatory;
      }
      :host > section > * {
        align-items: var(--section-child-align-items, center);
        display: flex;
        flex-direction: column;
        justify-content: var(--section-child-justify-content, center);;
        min-width: 100%;
        outline: none;
        scroll-snap-align: start;
      }
      :host > section:not(.scrolling) > *:not(.active) {
        opacity: 0;
      }
      :host > nav {
        align-items: center;
        align-self: ${this.hasAttribute('nav-align-self')
          ? this.getAttribute('nav-align-self')
          : 'var(--nav-align-self, end)'};
        display: flex;
        gap: var(--nav-gap);
        height: fit-content;
        margin: var(--nav-margin);
        max-height: 20%;
        overflow: hidden;
        justify-content: center;
      }
      :host > nav > * {
        --a-margin: 0;
        padding: 0;
        margin: 0;
      }
      @media only screen and (max-width: _max-width_) {
        :host > section {
          overflow-x: scroll;
        }
        :host > nav {
          gap: var(--nav-gap-mobile, var(--nav-gap));
          margin: var(--nav-margin-mobile, var(--nav-margin));
        }
      }
    `
    if (this.hasAttribute('background-color')) this.setCss(/* css */`
      :host {
        background-color: ${this.getAttribute('background-color')};
      }
    `, undefined, false)
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
      case 'carousel-two-default-':
        return this.fetchCSS([{
          path: `${import.meta.url.replace(/(.*\/)(.*)$/, '$1')}./default-/default-.css`, // apply namespace since it is specific and no fallback
          namespace: false
        }, ...styles], false)
      default:
        return this.fetchCSS(styles, false)
    }
  }

  /**
   * renders the html
   *
   * @return {Promise<void>}
   */
  renderHTML () {
    this.section = this.root.querySelector('section') || document.createElement('section')
    this.nav = this.root.querySelector('nav') || document.createElement('nav')
    if (this.section.children.length !== this.nav.children.length) {
      Array.from(this.section.children).forEach(node => {
      // generate nav if missing
      })
    }
    if (this.section.children[0]) this.section.children[0].classList.add('active')
    if (this.nav.children[0]) this.nav.children[0].classList.add('active')
    return Promise.resolve()
  }

  previous () {
    return this.scrollIntoView((this.activeSlide && this.activeSlide.previousElementSibling) || Array.from(this.section.children)[this.section.children.length - 1])
  }

  next () {
    return this.scrollIntoView((this.activeSlide && this.activeSlide.nextElementSibling) || Array.from(this.section.children)[0])
  }

  scrollIntoView (node) {
    if (!node.classList.contains('active')) {
      //node.scrollIntoView() // scrolls x and y
      this.section.scrollTo({
        left: this.section.scrollLeft + node.getBoundingClientRect().x - this.section.getBoundingClientRect().x,
        behavior: 'smooth'
      })
      this.scrollListener()
      node.focus() // important that default keyboard works
    }
    return node
  }

  get activeSlide () {
    return this.section.querySelector('.active')
  }
}
