
// @ts-check
import { Intersection } from '../../prototypes/Intersection.js'

/* global self */

/**
 * EmotionPictures
 * A picture shuffle Component
 *
 * @export
 * @class EmotionPictures
 * @type {CustomElementConstructor}
 */
export default class EmotionPictures extends Intersection() {
  constructor (options = {}, ...args) {
    super({
      ...options,
      importMetaUrl: import.meta.url,
      intersectionObserverInit: { rootMargin: '0px', threshold: 0.75 }
    }, ...args)

    this.setAttribute('role', 'banner')
    Array.from(this.aPictures).forEach(node => node.setAttribute('loading', this.getAttribute('loading') || 'eager'))
    Array.from(this.aVideos).forEach(node => node.setAttribute('loading', this.getAttribute('loading') || 'eager'))
    let timeout = null
    // force the emotion image to at least fill the over layed contents height
    this.resizeListener = event => {
      clearTimeout(timeout)
      timeout = setTimeout(() => {
        if (!this.overlayContent) return
        const overlayContentRect = this.overlayContent.getBoundingClientRect()
        const thisRect = this.getBoundingClientRect()
        // relative top to its parent
        const top = overlayContentRect.top - thisRect.top
        this.style.textContent = /* CSS */`
          :host > * a-picture {
            --img-max-height: max(calc(${Math.ceil(top + overlayContentRect.height)}px + var(--content-spacing)), var(--${this.namespace}img-max-height, 75vh));
          }
          @media only screen and (max-width: _max-width_) {
            :host > * a-picture {
              --img-max-height: max(calc(${Math.ceil(top + overlayContentRect.height)}px + var(--content-spacing-mobile, var(--content-spacing))), var(--${this.namespace}img-max-height, 75vh));
            }
          }
        `
      }, 200)
    }
  }

  intersectionCallback (entries, observer) {
    for (const entry of entries) {
      if (!entry.isIntersecting && entry.intersectionRatio === 0) {
        this.classList.add('visible')
        break
      }
      if (entry.isIntersecting && entry.intersectionRatio > 0) {
        this.classList.add('visible')
        break
      } else {
        this.classList.remove('visible')
      }
    }
  }

  connectedCallback () {
    super.connectedCallback()
    const init = () => {
      this.hidden = false
      if (this.shown && this.childNodes.length > 1) this.shuffle()
      this.css = /* CSS */`
      :host {
        --show: none;
        --appear: none;
      }
      `
      this.resizeListener()
    }
    this.hidden = true
    const showPromises = []
    if (this.shouldRenderCSS()) showPromises.push(this.renderCSS())
    if (this.aPicture && this.aPicture.hasAttribute('picture-load') && !this.aPicture.hasAttribute('loaded')) {
      showPromises.push(/** @type {Promise<void>} */(new Promise(resolve => this.addEventListener('picture-load', event => {
        if (!event || !event.detail || !event.detail.error) resolve()
      }, { once: true }))))
    }
    if (this.aVideo && this.aVideo.hasAttribute('video-load') && !this.aVideo.hasAttribute('loaded')) {
      showPromises.push(/** @type {Promise<void>} */(new Promise(resolve => this.addEventListener('video-load', event => resolve(), { once: true }))))
    }
    Promise.all(showPromises).then(init)
    self.addEventListener('resize', this.resizeListener)
  }

  disconnectedCallback () {
    super.disconnectedCallback()
    this.shuffle(false)
    self.removeEventListener('resize', this.resizeListener)
  }

  /**
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldRenderCSS () {
    return !this.root.querySelector(`:host > style[_css], ${this.tagName} > style[_css]`)
  }

  /**
   * renders the css
   *
   * @return {Promise<void>|void}
   */
  renderCSS () {
    this.css = /* css */`
      :host {
        display: grid !important;
        width: var(--width, 100%) !important;
        line-height: var(--line-height, normal);
      }
      :host > *:not(style), :host > a {
        grid-column: 1;
        grid-row: 1;
        opacity: 0;
        transition: var(--transition, opacity 2s ease-out);
        margin: 0;
        padding: 0;
      }
      :host > *.shown {
        opacity: 1;
        z-index: 3;
      }
      :host > div, :host > a {
        position: relative;
        width: var(--a-width, 100%);
      }
      :host > div > *:not(a-picture):not(a-video), :host > a > *:not(a-picture):not(a-video) {
        position: absolute;
        z-index: 2;
        top: var(--text-top, 4vw);
        left: var(--text-left, 10vw);
        right: var(--text-right, 10vw);
        opacity: 0;
        transition: var(--text-transition, opacity 0.5s ease-out);
      }
      :host(.visible) > div > *:not(a-picture):not(a-video), :host(.visible) > a > *:not(a-picture):not(a-video) {
        opacity: 1;
      }
      :host .subline {
        font-size: var(--subline-font-size, 1.2em);
        display: var(--subline-display, initial);
        --bg-padding: var(--bg-padding-custom, 1.2em);
      }
      :host .logo {
        align-items: ${this.logoPosition};
        box-sizing: border-box;
        display: flex;
        height: 100%;
        justify-content: flex-end;
        left: 0;
        margin: 0;
        padding: var(--padding);
        right: 0;
        top: 0;
      }
      @media only screen and (max-width: _max-width_) {
        :host {
          width: var(--width-mobile, var(--width, 100%)) !important;
        }
        :host > div h2.font-size-big, :host > a h2.font-size-big {
          font-size: var(--h2-font-size-mobile);
        }
        :host > div h1.font-size-big, :host > a h1.font-size-big {
          font-size: var(--h1-font-size-mobile);
        }
        :host > div > *:not(a-picture):not(a-video), :host > a > *:not(a-picture):not(a-video) {
          ${this.hasAttribute('height-mobile') ? `--text-top-mobile: calc((${this.getAttribute('height-mobile')}/2) - var(--h2-font-size-mobile, 1em));` : ''}
          top: var(--text-top-mobile, 2vw);
          left: var(--text-left-mobile, 0);
          right: var(--text-right-mobile, 0);
          margin:var(--div-margin-mobile);
        }
        :host .subline {
          display:var(--subline-display-mobile, initial);
        }
        :host .logo {
          padding: var(--padding-mobile);
        }
      }
    `
    this.setCss(/* css */`
      :host > * {
        ${this.hasAttribute('height') ? `--img-height: ${this.getAttribute('height')};` : ''}
        ${this.hasAttribute('height-mobile') ? `--img-height-mobile: ${this.getAttribute('height-mobile')};` : ''}
        --img-width: var(--${this.getAttribute('namespace') || ''}img-width, 100%);
        --img-max-height:var(--${this.getAttribute('namespace') || ''}img-max-height, 75vh);
        --img-object-fit:var(--${this.getAttribute('namespace') || ''}img-object-fit, cover);
        --picture-teaser-img-object-fit:var(--${this.getAttribute('namespace') || ''}img-object-fit, cover);
      }
    `, undefined, '', false)

    // add the style for resize to the html
    this.html = this.style

    const styles = [
      {
        // @ts-ignore
        path: `${this.importMetaUrl}../../../../css/style.css`, // apply namespace and fallback to allow overwriting on deeper level
        namespaceFallback: true
      }
    ]

    switch (this.getAttribute('namespace')) {
      case 'emotion-pictures-with-title-':
        return this.fetchCSS([{
          // @ts-ignore
          path: `${this.importMetaUrl}./with-title-/with-title-.css`,
          namespace: false
        }, ...styles], false)
      case 'emotion-pictures-with-button-':
        return this.fetchCSS([{
          // @ts-ignore
          path: `${this.importMetaUrl}./with-button-/with-button-.css`,
          namespace: false
        }, ...styles], false)
      case 'emotion-pictures-with-logo-':
        return this.fetchCSS([{
          // @ts-ignore
          path: `${this.importMetaUrl}./with-logo-/with-logo-.css`,
          namespace: false
        }, ...styles], false)
      case 'emotion-pictures-with-video-':
        return this.fetchCSS([{
          path: `${this.importMetaUrl}./with-title-/with-title-.css`, // apply namespace since it is specific and no fallback
          namespace: false
        },
        {
          // @ts-ignore
          path: `${this.importMetaUrl}./with-video-/with-video-.css`,
          namespace: false
        }, ...styles], false).then(fetchCSSParams => {
          // harmonize the emotion-picture-with-title-.css namespace with --emotion-picture-with-video
          fetchCSSParams[0].styleNode.textContent = fetchCSSParams[0].styleNode.textContent.replace(/--emotion-pictures-with-title-/g, '--emotion-pictures-with-video-')
        })
      case 'emotion-pictures-default-':
        return this.fetchCSS([{
          // @ts-ignore
          path: `${this.importMetaUrl}./default-/default-.css`,
          namespace: false
        }], false)
      default:
        return this.fetchCSS(styles, false)
    }
  }

  shuffle (start = true) {
    // @ts-ignore
    clearInterval(this.interval || null)
    if (start) {
      this.interval = setInterval(() => {
        let shown
        if ((shown = this.shown)) {
          this.childNodes.forEach(node => node.classList.remove('shown'))
          if (shown.nextElementSibling && shown.nextElementSibling.tagName !== 'STYLE') {
            shown.nextElementSibling.classList.add('shown')
          } else if (this.childNodes[0]) {
            this.childNodes[0].classList.add('shown')
          }
          EmotionPictures.updateLogoPosition(this.shown, '.logo', 'logo-position')
        }
      }, Number(this.getAttribute('interval')) || 8000)
    }
  }

  /**
   * Update Logo Position for each Element
   * @param {{ querySelector: (arg0: any) => any; }} divNode
   * @param {string} selector
   * @param {string} attribute
   */
  static updateLogoPosition (divNode, selector, attribute) {
    const logoElement = divNode.querySelector(selector)
    if (logoElement) {
      logoElement.style.alignItems = logoElement.getAttribute(attribute)
    }
  }

  get shown () {
    return this.root.querySelector('.shown') || (() => {
      if (this.childNodes[0]) this.childNodes[0].classList.add('shown')
      return this.childNodes[0]
    })()
  }

  get childNodes () {
    return Array.from(this.root.childNodes).filter(childNode => childNode.tagName !== 'STYLE')
  }

  get aPicture () {
    return this.root.querySelector('a-picture')
  }

  get aPictures () {
    return this.root.querySelectorAll('a-picture')
  }

  get aVideo () {
    return this.root.querySelector('a-video')
  }

  get aVideos () {
    return this.root.querySelectorAll('a-video')
  }

  get logoPosition () {
    return this.root.querySelector('.logo')?.hasAttribute('logo-position') ? this.root.querySelector('.logo').getAttribute('logo-position') : 'center'
  }

  get overlayContent () {
    return this.root.querySelector(':host > div > *:not(a-picture):not(a-video), :host > a > *:not(a-picture):not(a-video) ')
  }

  get style () {
    return this._style || (this._style = (() => {
      const style = document.createElement('style')
      style.setAttribute('protected', 'true')
      return style
    })())
  }
}
