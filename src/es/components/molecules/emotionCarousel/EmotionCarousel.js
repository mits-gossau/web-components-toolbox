import { Shadow } from '../../prototypes/Shadow.js'

/* global self */
/* global CustomEvent */

export default class EmotionCarousel extends Shadow() {
  constructor (options = {}, ...args) {
    super({ importMetaUrl: import.meta.url, tabindex: 'no-tabindex', ...options }, ...args)
    this.emotionPictures
    this.timer
    this.breakPoint = parseInt(self.Environment.mobileBreakpoint().replace('px', ''), 10)
    this.nextButtonListener = () => {
      clearInterval(this.timer)
      this.timer = setInterval(this.changeSlide, 10000)
      this.curSlide = (this.curSlide + 1) % this.slides.length
      this.updateSlideTransform(this.curSlide)
    }

    this.prevButtonListener = () => {
      this.curSlide = (this.curSlide - 1 + this.slides.length) % this.slides.length
      this.updateSlideTransform(this.curSlide)
    }

    this.resizeListener = () => {
      this.updateHeight()
    }

    this.pictureLoadListener = () => {
      if ((!this.height && window.innerWidth > this.breakPoint) || (!this.heightMobile && window.innerWidth <= this.breakPoint)) {
        this.updateHeight()
        window.addEventListener('resize', this.resizeListener)
      } else {
        if (window.innerWidth <= this.breakPoint) {
          this.updateShownHeight(this.heightMobile)
        } else {
          this.updateShownHeight(this.height)
        }
      }
    }

    this.changeSlide = () => {
      this.curSlide = (this.curSlide + 1) % this.slides.length
      this.updateSlideTransform(this.curSlide)
    }
  }

  connectedCallback () {
    if (this.shouldRenderCSS()) this.renderCSS()
    this.addEventListener('picture-load', this.pictureLoadListener)
    this.addEventListener('video-load', this.pictureLoadListener)
    this.curSlide = 0
    this.updateSlideTransform(this.curSlide)
    this.nextButton?.addEventListener('click', this.nextButtonListener)
    this.prevButton?.addEventListener('click', this.prevButtonListener)
    this.timer = setInterval(this.changeSlide, this.interval)
  }

  disconnectedCallback () {
    this.nextButton?.removeEventListener('click', this.nextButtonListener)
    this.prevButton?.removeEventListener('click', this.prevButtonListener)
    this.removeEventListener('picture-load', this.pictureLoadListener)
    this.removeEventListener('video-load', this.pictureLoadListener)
    window.removeEventListener('resize', this.resizeListener)
    clearInterval(this.timer)
  }

  shouldRenderCSS () {
    return !this.root.querySelector(`${this.cssSelector} > style[_css]`)
  }

  updateSlideTransform (curSlide) {
    this.slides.forEach((slide, index) => {
      const offset = index - curSlide
      slide.style.transform = `translateX(${offset * 100}%)`
    })
  }

  updateHeight () {
    const heights = []
    this.emotionPictures = this.root.querySelectorAll('a-emotion-pictures')
    if (this.emotionPictures) {
      this.emotionPictures.forEach(emotionPicture => {
        const elements = Array.from(emotionPicture.root.querySelectorAll('a-picture, a-video'))
          .filter(element => element.getAttribute('namespace') !== 'emotion-pictures-general-logo-')
        elements.forEach(element => {
          const variableElement = element.root.querySelector('img, video')
          heights.push(variableElement.offsetHeight)
        })
      })
    }
    if (heights.length > 0) {
      const minHeight = Math.min(...heights)
      this.style.height = `${minHeight}px`
      this.updateShownHeight(`${minHeight}px`)
    }
  }

  updateShownHeight (height) {
    if (!this.emotionPictures) {
      this.emotionPictures = this.root.querySelectorAll('a-emotion-pictures')
    }

    this.emotionPictures.forEach(emotionPicture => {
      if (!this.setHeightForShownElement(emotionPicture, height)) {
        const observer = new MutationObserver(() => {
          if (this.setHeightForShownElement(emotionPicture, height)) {
            observer.disconnect()
          }
        })
        observer.observe(emotionPicture.shadowRoot, { childList: true, subtree: true })
      }
    })
  }

  setHeightForShownElement (emotionPicture, height) {
    const shown = emotionPicture.shadowRoot.querySelector('.shown')
    if (shown) {
      shown.style.height = height
      return true
    }
    return false
  };

  renderCSS () {
    this.css = /* css */`
      :host {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        height: ${this.height};
        max-height: var(--img-max-height, none);
        margin: 0;
        width: var(--width, 100%) !important;
      }

      :host .controls {
        font-size: var(--controls-font-size, 2.5em);
      }

      .component-container {
        width: var(--component-container-width, 100%);
        height: var(--component-container-height, 100%);
        overflow: hidden;
        position: relative;
        z-index: 2;
      }

      .slide {
        width: var(--slide-width, 100%);
        height: var(--slide-height, 100%);
        position: absolute;
        transition: var(--silde-transition, all 0.5s);
        display: flex;
        flex-direction: column;
        pointer-events: none;
      }

      a-emotion-pictures{
        width: 100%;
        height: 100%;
        position: static;
        z-index: 0;
        pointer-events: auto;
      }

      .controls {
        display: flex;
        position: absolute;
        width: var(--controls-width, 100%);
        height: auto;
        max-height: var(--controls-max-height, ${this.height});
        height: var(--controls-height, 100%);
        z-index: 3;
        justify-content: space-between;
        pointer-events: none;
      }

      .arrow-btn {
        padding: var(--arrow-btn-padding, 2%);
      }

      .section {
        height: var(--section-height, 100%);
        width: var(--section-width, 30%);
        display: flex;
        align-items: center;
        cursor: pointer;
        pointer-events: auto;
      }

      .section.right {
        justify-content: flex-end;
      }

      @media only screen and (max-width: _max-width_) {
        :host {
          ${this.heightMobile ? 'height: var(--height-mobile, ' + this.heightMobile + ') !important;' : ''}
        }
        .controls {
          display: none;
        }
      }`
    return this.fetchTemplate()
  }

  fetchTemplate () {
    /** @type {import("../../prototypes/Shadow.js").fetchCSSParams[]} */
    const styles = [
      {
        path: `${this.importMetaUrl}../../../../css/reset.css`,
        namespace: false
      },
      {
        path: `${this.importMetaUrl}../../../../css/style.css`,
        namespaceFallback: false
      }
    ]

    switch (this.getAttribute('namespace')) {
      case 'emotion-carousel-default-':
        return this.fetchCSS([
          {
            path: `${this.importMetaUrl}./default-/default-.css`,
            namespace: false
          },
          ...styles
        ])
      default:
        return this.fetchCSS(styles)
    }
  }

  get slides () {
    return this.root.querySelectorAll('.slide')
  }

  get nextButton () {
    return this.root.querySelector('.section.right')
  }

  get prevButton () {
    return this.root.querySelector('.section.left')
  }

  get interval () {
    return this.getAttribute('interval') || 10000
  }

  get height () {
    return this.getAttribute('height')
  }

  get heightMobile () {
    return this.getAttribute('height-Mobile')
  }
}
