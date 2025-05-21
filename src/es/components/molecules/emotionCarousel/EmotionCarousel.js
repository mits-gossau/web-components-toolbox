import { Shadow } from '../../prototypes/Shadow.js'

export default class EmotionCarousel extends Shadow() {
  constructor (options = {}, ...args) {
    super({ importMetaUrl: import.meta.url, ...options }, ...args)
  }

  connectedCallback () {
    if (this.shouldRenderCSS()) this.renderCSS()

    let curSlide = 0
    this.updateSlideTransform(curSlide)

    this.nextButton?.addEventListener('click', () => {
      clearInterval(timer)
      timer = setInterval(changeSlide, 10000)
      curSlide = (curSlide + 1) % this.slides.length
      this.updateSlideTransform(curSlide)
    })

    this.prevButton?.addEventListener('click', () => {
      curSlide = (curSlide - 1 + this.slides.length) % this.slides.length
      this.updateSlideTransform(curSlide)
    })

    const changeSlide = () => {
      curSlide = (curSlide + 1) % this.slides.length
      this.updateSlideTransform(curSlide)
    }

    let timer = setInterval(changeSlide, this.interval)
  }

  disconnectedCallback () {
    this.nextButton?.removeEventListener('click', () => {})
    this.prevButton?.removeEventListener('click', () => {})
    clearInterval(timer)
  }

  shouldRenderCSS () {
    return !this.root.querySelector(`:host > style[_css], ${this.tagName} > style[_css]`)
  }

  updateSlideTransform (curSlide) {
    this.slides.forEach((slide, index) => {
      const offset = index - curSlide
      slide.style.transform = `translateX(${offset * 100}%)`
    })
  }

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
        font-size: var(--controls-font-size, 1.2rem);
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
          height: var(--height-mobile, ${this.heightMobile});
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
    return this.getAttribute('height') || '38vw'
  }

  get heightMobile () {
    return this.getAttribute('height-Mobile') || '40vh'
  }
}
