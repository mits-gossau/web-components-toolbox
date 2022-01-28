// @ts-check
import { Intersection } from '../prototypes/Intersection.js'

/* global CustomEvent */
/* global self */

/**
 * Flyer can hold anything which shall fly into the viewport on intersection
 * Example at: /src/es/components/pages/Home.html
 *    src/es/components/molecules/NavigationClassics.html
 * As a molecule, this component shall hold Atoms
 *
 * @export
 * @class Flyer
 * @type {CustomElementConstructor}
 * @css {
 *  --background-color [transparent]
 *  --padding [20px]
 *  --margin [0]
 *  --text-align [left|right]
 *  --duration [0.7s]
 *  --transform [translateX(var(--translate-x, 0))] if set will overwrite the translateX
 *  --translate-x [0] if transform is set it will be ignored
 *  --z-index [99]
 * NOTE: The below only work with position=fixed
 *  --top: [auto] -auto-gen can be overwritten here, be sure to set the opposite to auto to take effect
 *  --right: [auto] -auto-gen can be overwritten here, be sure to set the opposite to auto to take effect
 *  --bottom: [auto] -auto-gen can be overwritten here, be sure to set the opposite to auto to take effect
 *  --left: [auto] -auto-gen can be overwritten here, be sure to set the opposite to auto to take effect
 * }
 * @attribute {
 *  {fixed | false} [position=fixed] set to fixed if it is desired for the flyer to follow the scroll for the defined rootMargin. NOTE: it is by default fixed... see => this.isPositionFixed
 *  {number} [timer=false] if any number all intersection settings will be ignored and the flyer will appear after the timeout
 *  {string} [href=falsy] used for the link reference
 *  {up, right, down, left} [direction=left] position will always be fixed when "up" or "down"
 *  {string} [picture-load=""] does listen to an event with name set by picture-load and then triggerTimeout once the picture is loaded to avoid any loading/image composition while the flyer is already within its own animation
 * }
 */
export default class Flyer extends Intersection() {
  constructor (options = {}, ...args) {
    super(Object.assign(options, { intersectionObserverInit: { rootMargin: '500px 0px 0px 0px', threshold: 1 } }), ...args)

    this.div = document.createElement('div')
    Array.from(this.root.children).forEach(node => {
      if (node.getAttribute('slot') || node.nodeName === 'STYLE') return false
      this.div.appendChild(node)
    })
    this.html = this.div

    this.clickListener = event => {
      if (this.hasAttribute('href')) {
        event.preventDefault()
        self.open(this.getAttribute('href'), this.getAttribute('target') || '_self', this.hasAttribute('rel') ? `rel=${this.getAttribute('rel')}` : '')
      }
    }
    // link behavior made accessible
    if (this.hasAttribute('href')) {
      this.setAttribute('data-href', this.getAttribute('href'))
      this.setAttribute('role', 'link')
    }
    this.closeClickListener = event => {
      event.preventDefault()
      event.stopPropagation()
      this.div.classList.remove('visible')
    }
    this.pictureLoadListener = event => {
      if (this.getAttribute('timer')) {
        this.triggerTimeout()
      } else {
        // only connect intersection callback if no timer is set
        super.connectedCallback()
      }
    }
    this.transitionendListener = event => this.dispatchEvent(new CustomEvent(this.getAttribute('flyer-transitionend') || 'flyer-transitionend', {
      detail: {
        origEvent: event,
        child: this
      },
      bubbles: true,
      cancelable: true,
      composed: true
    }))
  }

  connectedCallback () {
    if (this.shouldComponentRenderCSS()) this.renderCSS()
    if (this.hasAttribute('picture-load')) {
      if (this.root.querySelectorAll(`[${this.getAttribute('picture-load') || 'picture-load'}][loaded=true]`).length) {
        this.pictureLoadListener()
      } else {
        this.addEventListener(this.getAttribute('picture-load') || 'picture-load', this.pictureLoadListener, { once: true })
      }
    } else if (this.getAttribute('timer')) {
      this.triggerTimeout()
    } else {
      // only connect intersection callback if no timer is set
      super.connectedCallback()
    }
    this.addEventListener('click', this.clickListener)
    if (this.closeBtn) this.closeBtn.addEventListener('click', this.closeClickListener)
    if (this.hasAttribute('flyer-transitionend')) this.div.addEventListener('transitionend', this.transitionendListener, { once: true })
  }

  disconnectedCallback () {
    if (this.hasAttribute('picture-load')) {
      this.removeEventListener(this.getAttribute('picture-load') || 'picture-load', this.pictureLoadListener)
    } else if (!this.getAttribute('timer')) super.disconnectedCallback()
    this.removeEventListener('click', this.clickListener)
    if (this.closeBtn) this.closeBtn.removeEventListener('click', this.closeClickListener)
    if (this.hasAttribute('flyer-transitionend')) this.div.removeEventListener('transitionend', this.transitionendListener)
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
   * renders the m-Flyer css
   *
   * @return {void}
   */
  renderCSS () {
    this.css = /* css */`
      :host {
        ${this.getAttribute('href') ? 'cursor: pointer;' : ''}
        display: block;
        box-sizing: border-box;
        left: 0;
        position: var(--position, absolute);
        width: 100%;
        margin: var(--margin, 0) !important;
        overflow: var(--overflow, hidden);
      }
      :host > div {
        background-color: var(--background-color, transparent);
        ${this.isPositionFixed ? 'position: fixed;' : ''}
        top: var(--top, var(--top-auto-gen, auto));
        right: var(--right, var(--right-auto-gen, auto));
        bottom: var(--bottom, var(--bottom-auto-gen, auto));
        left: var(--left, var(--left-auto-gen, auto));
        padding: var(--padding, 20px);
        margin: var(--margin, 0);
        text-align: var(--text-align, ${this.getAttribute('direction') === 'right' ? 'right' : 'left'});
        transform: ${this.getAttribute('direction') === 'up' ? 'translateY(-100vh)' : this.getAttribute('direction') === 'right' ? 'translateX(100vw)' : this.getAttribute('direction') === 'down' ? 'translateY(100vh)' : 'translateX(-100vw)'};
        transition: all var(--duration, 0.7s) var(--timing, ease);
        visibility: hidden;
        z-index: var(--z-index, 99);
      }
      :host > div.visible {
        transform: var(--transform, translateX(var(--translate-x, 0)));
        visibility: visible;
      }
      :host > div > * {
        max-height: 100%;
        max-width: 100%;
      }
      :host #close {
        cursor: pointer;
      }
      @media only screen and (max-width: ${this.getAttribute('mobile-breakpoint') ? this.getAttribute('mobile-breakpoint') : self.Environment && !!self.Environment.mobileBreakpoint ? self.Environment.mobileBreakpoint : '1000px'}) {
        :host > div {
          transition: all var(--duration-mobile, var(--duration, 0.7s)) var(--timing-mobile, var(--timing, ease));
        }
      }
    `
  }

  intersectionCallback (entries, observer) {
    if (entries && entries[0]) {
      if (entries[0].isIntersecting) {
        if (this.isPositionFixed) {
          this.css = /* css */`
         :host {
           ${this.varTop};
           ${this.varRight}
           ${this.varBottom};
           ${this.varLeft}
         }
        `
        }
        this.div.classList.add('visible')
      } else {
        this.div.classList.remove('visible')
      }
    }
  }

  triggerTimeout () {
    setTimeout(() => {
      this.css = /* css */`
        :host {
          ${this.varTop};
          ${this.varRight}
          ${this.varBottom};
          ${this.varLeft}
        }
      `
      this.div.classList.add('visible')
    }, Number(this.getAttribute('timer')))
  }

  get topMiddle () {
    return `${(self.innerHeight - this.div.offsetHeight) / 2}px`
  }

  get leftMiddle () {
    return `${(self.innerWidth - this.div.offsetWidth) / 2}px`
  }

  get varTop () {
    if (this.getAttribute('direction') === 'up') return '--top-auto-gen: 0;'
    return this.getAttribute('direction') === 'left' || this.getAttribute('direction') === 'right' ? `--top-auto-gen: ${this.topMiddle};` : ''
  }

  get varRight () {
    return this.getAttribute('direction') === 'right' ? '--right-auto-gen: 0;' : ''
  }

  get varBottom () {
    return this.getAttribute('direction') === 'down' ? '--bottom-auto-gen: 0;' : ''
  }

  get varLeft () {
    return this.getAttribute('direction') === 'up' || this.getAttribute('direction') === 'down' ? `--left-auto-gen: ${this.leftMiddle};` : ''
  }

  get isPositionFixed () {
    return this.getAttribute('position') === 'fixed' || !this.getAttribute('position') || this.getAttribute('direction') === 'up' || this.getAttribute('direction') === 'down'
  }

  get closeBtn () {
    return this.root.querySelector('#close')
  }
}
