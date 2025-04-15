import { Shadow } from '../../prototypes/Shadow.js';

export default class EmotionCarousel extends Shadow() {
  slides;
  nextButton;
  prevButton;

  constructor(options = {}, ...args) {
    super({ hoverInit: undefined, importMetaUrl: import.meta.url, ...options }, ...args);

    this.slides = this.root.querySelectorAll('.slide');
    this.nextButton = this.root.querySelector('.section.right');
    this.prevButton = this.root.querySelector('.section.left');
  }

  connectedCallback() {
    if (this.shouldRenderCSS()) this.renderCSS();

    let curSlide = 0;
    this.updateSlideTransform(curSlide);

    this.nextButton?.addEventListener('click', () => {
      clearInterval(timer);
      timer = setInterval(changeSlide, 10000);
      curSlide = (curSlide + 1) % this.slides.length;
      this.updateSlideTransform(curSlide);
    });

    this.prevButton?.addEventListener('click', () => {
      curSlide = (curSlide - 1 + this.slides.length) % this.slides.length;
      this.updateSlideTransform(curSlide);
    });

    const changeSlide = () => {
      curSlide = (curSlide + 1) % this.slides.length;
      this.updateSlideTransform(curSlide);
    };

    let timer = setInterval(changeSlide, 10000);
  }

  shouldRenderCSS() {
    return !this.root.querySelector(`:host > style[_css], ${this.tagName} > style[_css]`);
  }

  updateSlideTransform(curSlide) {
    this.slides.forEach((slide, index) => {
      const offset = index - curSlide;
      slide.style.transform = `translateX(${offset * 100}%)`;
    });
  }

  renderCSS() {
    this.css = /* css */`
      :host {
        font-family: var(--h2-font-family, 'Arial');
        text-shadow: 1px 3px 18px black;
        --color: white;
        font-size: large;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        height: 38vw;
        max-height: var(--emotion-carousel-img-max-height, none);
        margin: 0;
      }

      :host h2 {
        font-size: var(--h1-font-size, 36px);
      }

      :host .controls {
        font-size: 1.2em;
      }

      .component-container {
        display: flex;
        flex-direction: column;
        width: 100%;
        height: 100%;
        overflow: hidden;
        position: relative;
        z-index: 2;
      }

      .slide {
        width: 100%;
        height: 100%;
        position: absolute;
        transition: all 0.5s;
        display: flex;
        flex-direction: column;
      }

      a-emotion-pictures {
        width: 100%;
        height: 100%;
        position: static;
        z-index: 0;
        pointer-events: none;
      }

      a-emotion-pictures a-picture {
        --picture-cover-img-max-height: none;
      }

      .controls {
        display: flex;
        position: absolute;
        width: 100%;
        height: auto;
        max-height: 100%;
        height: 100%;
        z-index: 3;
        justify-content: space-between;
        pointer-events: none;
      }

      a-picture img {
        object-position: center;
      }

      .slide-description {
        display: flex;
        text-align: left;
        justify-content: center;
        flex-direction: column;
        position: absolute;
        left: 30%;
        z-index: 4;
        max-width: 36%;
        width: auto;
        height: 100%;
        color: white;
        padding: 10px;
        box-sizing: border-box;
        bottom: 0;
      }

      .slide-description-left {
        width: 30%;
      }

      .btn {
        padding: 2%;
      }

      .section {
        height: 100%;
        width: 30%;
        display: flex;
        align-items: center;
        cursor: pointer;
        pointer-events: auto;
      }

      .section.right {
        justify-content: flex-end;
      }

      .link-description {
        position: absolute;
        padding: 1%;
        display: flex;
        color: white;
        text-decoration: none;
        border-bottom: 3px solid white;
        z-index: 5;
        font-size: small;
      }

      @media only screen and (max-width: 767px) {
        :host {
          height: 40vh;
        }

        .slide-description,
        .link-description {
          font-size: 0.8em;
        }

        :host h2 {
          font-size: 2em;
          margin-block-end: 0.2em;
          margin-block-start: 0.2em;
        }

        .title {
          width: 100%;
        }

        :host .slide-description {
          max-width: 80%;
          left: 10%;
          padding: 0;
        }

        .controls {
          display: none;
        }
      }
    `;
    return this.fetchTemplate();
  }

  fetchTemplate() {
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
    ];

    switch (this.getAttribute('namespace')) {
      case 'emotion-carousel-default-':
        return this.fetchCSS([
          {
            path: `${this.importMetaUrl}./default-/default-.css`,
            namespace: false
          },
          ...styles
        ]);
      default:
        return this.fetchCSS(styles);
    }
  }
}
