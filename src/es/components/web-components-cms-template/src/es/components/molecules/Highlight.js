// @ts-check
import { Shadow } from '../prototypes/Shadow.js'

/* global self */

/**
 * Highlight can be wrapped by src/es/components/organisms/HighlightList.js and expects h5, h2, p, img
 * Example at: /src/es/components/pages/Home.html + /src/es/components/pages/ClubConcerts.html
 * As a molecule, this component shall hold Atoms
 *
 * @export
 * @class Highlight
 * @type {CustomElementConstructor}
 * @attribute {
 *  {string} href used for the link reference
 * }
 * @css {
 *  --color-hover [#8d4674]
 *  --h2-font-family [--font-family]
 *  --h2-font-size [4rem]
 *  --h2-font-size-mobile [2.5rem]
 *  --h2-text-transform [none]
 *  --h5-font-family [--font-family-secondary]
 *  --h5-font-size [1.5rem]
 *  --h5-text-transform [uppercase]
 *  --img-min-width [200px]
 *  --img-min-width-mobile [50px]
 *  --text-align [center]
 *  --filter [none]
 *  --filter-hover [none]
 *  --margin [0 0 1rem 0]
 *  --p-font-family [--font-family-secondary]
 *  --p-font-size [1rem]
 *  --p-text-transform [none]
 *  --text-align [center]
 * }
 */
export default class Highlight extends Shadow() {
  constructor (...args) {
    super(...args)

    this.clickListener = event => {
      if (this.hasAttribute('href')) self.open(this.getAttribute('href'), this.getAttribute('target') || '_self', this.hasAttribute('rel') ? `rel=${this.getAttribute('rel')}` : '')
    }
    // link behavior made accessible
    if (this.hasAttribute('href')) {
      this.setAttribute('data-href', this.getAttribute('href'))
      this.setAttribute('role', 'link')
    }
  }

  connectedCallback () {
    if (this.shouldComponentRenderCSS()) this.renderCSS()
    if (this.shouldComponentRenderHTML()) this.renderHTML()
    this.addEventListener('click', this.clickListener)
  }

  disconnectedCallback () {
    this.removeEventListener('click', this.clickListener)
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
    return [this.h2 && this.h5 && this.p].some(node => !node || !node.parentElement || node.parentElement.nodeName !== 'SECTION') && [this.img].some(node => !node || !node.parentElement || node.parentElement.nodeName !== 'FIGURE')
  }

  /**
   * renders the m-Highlight css
   *
   * @return {void}
   */
  renderCSS () {
    this.css = /* css */`
      :host {
        cursor: ${this.getAttribute('href') ? 'pointer' : 'auto'};
      }
      :host > * {
        margin: 0 auto;
      }
      section {
        flex-grow: 1;
        flex-shrink: 2;
        text-align: var(--text-align, center);
        width: var(--section-width, auto);
      }
      section > * {
        margin: var(--margin, 0 0 1rem 0);
      }
      section > *:last-child {
        margin-bottom: 0;
      }
      ${this.getAttribute('href')
        ? `section h2:hover {
          color: var(--color-hover, var(--color, #8d4674));
        }`
        : ''
      }
      figure {
        /* caution: if this is display: flex check img height on IOS Safari */
        text-align: var(--text-align, center);
        margin: 0;
        width: var(--figure-width, auto);
      }
      figure:hover img {
        filter: var(--filter-hover, none);
      }
      :host h2 {
        font-family: var(--h2-font-family, var(--font-family-bold));
        font-weight: var(--h2-font-weight, var(--font-weight, normal));
        font-size: var(--h2-font-size, 4rem);
        line-height: var(--h2-line-height, normal);
        text-transform: var(--h2-text-transform, none);
      }
      :host h5 {
        font-family: var(--h5-font-family, var(--font-family-secondary));
        font-weight: var(--h5-font-weight, var(--font-weight, normal));
        font-size: var(--h5-font-size, 1.5rem);
        line-height: var(--h5-line-height, normal);
        text-transform: var(--h5-text-transform, uppercase);
      }
      :host p {
        font-family: var(--p-font-family, var(--font-family-secondary));
        font-weight: var(--p-font-weight, var(--font-weight, normal));
        font-size: var(--p-font-size, 1rem);
        text-transform: var(--p-text-transform, none);
        margin: var(--p-margin, 3px 0);
      }
      :host p.date {
        font-family: var(--font-family-bold);
        text-transform: var(--p-date-text-transform, none);
      }
      :host a {
        color: var(--a-color, var(--color-secondary, var(--color, pink)));
        text-decoration: var(--a-text-decoration, var(--text-decoration, none));
      }
      :host a:hover {
        color: var(--a-color-hover, var(--color-hover-secondary, var(--color-hover, var(--color, green))));
        text-decoration: var(--a-text-decoration-hover, var(--text-decoration-hover, var(--a-text-decoration, var(--text-decoration, none))));
      }
      :host ul {
        list-style-type: none;
        margin-bottom: 30px;
        padding: 0;
      }
      :host ul li a {
        color: var(--ul-a-color, var(--a-color, var(--color-secondary, var(--color, pink))));
      }
      :host ul li a:hover {
        color: var(--ul-a-color-hover, var(--a-color-hover, var(--color-hover-secondary, var(--color-secondary, var(--color, green)))));
      }
      img {
        filter: var(--filter, none);
        height: auto;
        object-fit: scale-down;
        max-width: var(--img-max-width, 100%);
        min-width: var(--img-min-width, 200px);
        transition: var(--transition, none);
      }
      @media only screen and (max-width: ${this.getAttribute('mobile-breakpoint') ? this.getAttribute('mobile-breakpoint') : self.Environment && !!self.Environment.mobileBreakpoint ? self.Environment.mobileBreakpoint : '1000px'}) {
        section {
          width: var(--section-width-mobile, auto);
        }
        figure {
          width: var(--figure-width-mobile, auto);
        }
        :host h2 {
          font-size: var(--h2-font-size-mobile, 2.5rem);
          line-height: var(--h2-line-height-mobile, var(--h2-line-height, 2.5rem));
        }
        :host h5 {
          font-size: var(--h5-font-size-mobile, 1.5rem);
          line-height: var(--h5-line-height-mobile, var(--h5-line-height, 1.5rem));
        }
        :host p {
          margin: var(--p-margin-mobile, 3px 0);
          font-size: var(--p-font-size-mobile, 1rem);
        }
        :host p.date > span {
          display: block;
        }
        :host img {
          min-width: var(--img-min-width-mobile, 50px);
        }
      }
    `
  }

  /**
   * renders the a-link html
   *
   * @return {void}
   */
  renderHTML () {
    Array.from(this.root.children).filter(child => child !== this.figure && child !== this.section).forEach(node => {
      if (node.getAttribute('slot') || node.nodeName === 'STYLE') return false
      if (this.belongsToFigure(node)) {
        this.figure.appendChild(node)
      } else {
        this.section.appendChild(node)
      }
    })
  }

  belongsToFigure (node) {
    return node.nodeName === 'IMG' || node.nodeName === 'FIGCAPTION' || node.nodeName === 'FIGURE' || node.nodeName.includes('PICTURE') || node.nodeName.includes('INTERSECTION-SCROLL-EFFECT')
  }

  get h2 () {
    return this.root.querySelector('h2')
  }

  get h5 () {
    return this.root.querySelector('h5')
  }

  get p () {
    return this.root.querySelector('p')
  }

  get img () {
    return this.root.querySelector('img')
  }

  get section () {
    return this.root.querySelector('section') || (() => {
      // create section if it is not yet set and position it at the correct position before or after the image
      const section = document.createElement('section')
      if (this.root.children && this.root.children[0] && this.belongsToFigure(this.root.children[0])) {
        this.root.appendChild(section)
      } else {
        this.root.prepend(section)
      }
      return section
    })()
  }

  get figure () {
    return this.root.querySelector('figure') || (() => {
      // create figure if it is not yet set and position it at the correct position before or after the image
      const figure = document.createElement('figure')
      if (this.root.children && this.root.children[0] && this.belongsToFigure(this.root.children[0])) {
        this.root.prepend(figure)
      } else {
        this.root.appendChild(figure)
      }
      return figure
    })()
  }
}
