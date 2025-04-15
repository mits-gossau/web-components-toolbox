import { Shadow } from '../../prototypes/Shadow.js'
export default class HistoryGallery extends Shadow() {
  yearSwiper
  yearCarouselComponent
  yearlist
  slides
  swipes
  nextButton

  constructor(options = {}, ...args) {
    super({ hoverInit: undefined, importMetaUrl: import.meta.url, ...options }, ...args)

    this.yearSwiper = this.root.querySelector('.year-swiper')
    this.yearCarouselComponent = this.root.querySelector('.component-container')
    this.yearlist = Array.from(this.root.querySelectorAll('.swipe'))
    this.slides = this.root.querySelectorAll('.slide')
    this.swipes = this.root.querySelectorAll('.swipe')
    this.nextButton = this.root.querySelector('.section.right')
    this.prevButton = this.root.querySelector('.section.left')
  }

  connectedCallback() {
    if (this.shouldRenderCSS()) this.renderCSS()
    let timeout = null
    window.addEventListener('resize', event => {
      clearTimeout(timeout)
      timeout = setTimeout(() => this.updateSlideTransform(Array.from(this.yearSwiper.children).indexOf(this.yearSwiper.querySelector('.active-year'))), 200)
    })

    let curSlide = 0
    this.updateSlideTransform(curSlide)

    this.nextButton.addEventListener('click', () => {
      curSlide++

      if (curSlide === this.slides.length) {
        curSlide = 0
      }

      this.updateSlideTransform(curSlide)
    })

    this.prevButton.addEventListener('click', () => {
      if (curSlide === 0) {
        curSlide = this.slides.length - 1
      } else {
        curSlide--
      }

      this.updateSlideTransform(curSlide)
    })

    this.swipes.forEach((swipe, index) => {
      swipe.addEventListener('click', () => {
        curSlide = index
        this.updateSlideTransform(curSlide)
      })
    })
  }

  shouldRenderCSS() {
    return !this.root.querySelector(`:host > style[_css], ${this.tagName} > style[_css]`)
  }

  updateSlideTransform(curSlide) {
    const carouselWidth = this.yearCarouselComponent.offsetWidth

    const translateValue = (carouselWidth / 2) - (this.yearSwiper.children[curSlide].offsetWidth / 2) - (this.yearSwiper.children[curSlide].getBoundingClientRect().left - this.yearSwiper.getBoundingClientRect().left)
    this.yearSwiper.style.transform = `translateX(${translateValue}px)`

    this.slides.forEach((slide, index) => {
      const offset = index - curSlide
      slide.style.transform = `translateX(${offset * 100}%)`

      if (offset === 0) {
        this.yearlist[index].classList.add('active-year')
      } else {
        this.yearlist[index].classList.remove('active-year')
      }
    })
  }

  renderCSS() {
    this.css = /* css */`

          :host {
          font-size: var(--font-size, large);
          display: var(--display, flex);
          justify-content: var(--justify-content, center);
          align-items: var(--align-items, center);
          flex-direction: var(--flex-direction, column);
          height: var(--height, fit-content);
          margin: var(--margin, 0);
        }

        .component-container {
          display: var(--component-container-display, flex);
          justify-content: var(--component-container-justify-content, center);
          align-items: var(--component-container-align-items, center);
          flex-direction: var(--component-container-flex-direction, column);
          width: var(--component-container-width, 100%);
          height: var(--component-container-height, 70vh);
          overflow: hidden;
        }

        .carousel-container {
          height: var(--carousel-container-height, 100%);
          width: var(--carousel-container-width, 100%);
          position: relative;
          overflow: hidden;
          background: var(--carousel-container-background, rgb(207 207 207));
          border-radius: var(--carousel-container-border-radius, 0.5em);
        }

        .slide {
          width: 100%;
          height: 100%;
          position: absolute;
          transition: all 0.5s;
          display: flex;
          flex-direction: column;
        }

        .slide a-picture {
          width: 100%;
          height: 100%;
          position: static;
          z-index: 0;
        }

        .controls {
          display: var(--controls-display, flex);
          align-items: var(--controls-align-items, center);
          position: relative;
          width: 100%;
          height: 100%;
          z-index: 2;
        }

        .slide-description {
          --p-text-align: center;
          display: flex;
          text-align: center;
          justify-content: center;
          position: absolute;
          font-size: small;
          background-color: rgba(0, 0, 0, 0.4);
          z-index: 2;
          width: 100%;
          color: white;
          padding: 30px;
          box-sizing: border-box;
          bottom: 0;
        }

        .btn {
          padding: var(--btn-padding, 2%);
        }

        .btn-prev:active {
          transform: scale(var(--btn-active-scale, 1.2));
        }

        .btn-next:active {
          transform: scale(var(--btn-active-scale, 1.2));
        }

        .year-swiper {
          font-size: var(--year-swiper-font-size, x-large);
          display: flex;
          transition: all 0.5s;
          width: 100%;
          padding-top: var(--year-swiper-padding-top, 2%);
        }

        .section {
          --h1-margin: 0;
          height: 100%;
          width: 50%;
          display: flex;
          align-items: center;
          cursor: pointer;
        }

        .section.right {
          justify-content: flex-end;
        }

        .swipe {
          margin-right: var(--swipe-margin-right, 10%);
          cursor: pointer;
        }

        .active-year {
          color: var(--active-year-color, var(--color-tertiary, #ffff));
          font-weight: bold;
        }

        @media only screen and (max-width: 1200px) {
          :host a-picture {
            --svg-size: 2em;
          }

          .component-container {
            height: var(--component-container-height-mobile, 60vh);
          }
        }

        @media only screen and (max-width: 767px) {
          :host {
            --svg-size: 1.5em;
          }

          .carousel-container {
            border-radius: var(--carousel-container-border-radius-mobile, 0.3em);
          }
        }
        `
        return this.fetchTemplate()
  }

  fetchTemplate () {
    /** @type {import("../../prototypes/Shadow.js").fetchCSSParams[]} */
    const styles = [
      {
        path: `${this.importMetaUrl}../../../../css/reset.css`, // no variables for this reason no namespace
        namespace: false
      },
      {
        path: `${this.importMetaUrl}../../../../css/style.css`, // apply namespace and fallback to allow overwriting on deeper level
        namespaceFallback: false
      }
    ]
    switch (this.getAttribute('namespace')) {
      case 'history-gallery-default-':
        console
        return this.fetchCSS([{
          path: `${this.importMetaUrl}./default-/default-.css`, // apply namespace since it is specific and no fallback
          namespace: false
        }, ...styles])
      default:
        return this.fetchCSS(styles)
        
    }
  }
}
