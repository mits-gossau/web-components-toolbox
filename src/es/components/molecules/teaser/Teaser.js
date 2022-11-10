// @ts-check
import { Intersection } from '../../prototypes/Intersection.js'

/* global self */

/**
 * As a molecule, this component shall hold Atoms
 *
 * @export
 * @class Teaser
 * @type {CustomElementConstructor}
 */
export default class Teaser extends Intersection() {
  constructor (options = {}, ...args) {
    super(Object.assign(options, { intersectionObserverInit: { rootMargin: '0px 0px 0px 0px' } }), ...args)

    this.setAttribute('role', 'figure')
    this.clickListener = event => {
      if (this.hasAttribute('href')) self.open(this.getAttribute('href'), this.getAttribute('target') || '_self', this.hasAttribute('rel') ? `rel=${this.getAttribute('rel')}` : '')
    }
    // link behavior made accessible
    if (this.hasAttribute('href')) {
      this.setAttribute('data-href', this.getAttribute('href'))
      this.setAttribute('role', 'link')
    }
    this.mouseoverListener = event => {
      if (this.aArrow) this.aArrow.setAttribute('hover', 'true')
    }
    this.mouseoutListener = event => {
      if (this.aArrow) this.aArrow.setAttribute('hover', '')
    }
  }

  connectedCallback () {
    super.connectedCallback()
    const showPromises = []
    if (this.shouldComponentRenderCSS()) showPromises.push(this.renderCSS())
    if (this.aPicture && this.aPicture.hasAttribute('picture-load') && !this.aPicture.hasAttribute('loaded')) showPromises.push(new Promise(resolve => this.addEventListener('picture-load', event => resolve(), { once: true })))
    if (showPromises.length) {
      this.hidden = true
      Promise.all(showPromises).then(() => {
        if (!this.hasAttribute('no-figcaption-bg-color-equal')) {
          self.requestAnimationFrame(timeStamp => {
            let figcaption, figcaptionBackgroundColor
            if ((figcaption = this.root.querySelector('figcaption')) && ((figcaptionBackgroundColor = self.getComputedStyle(figcaption).getPropertyValue(`--${this.namespace || ''}figcaption-background-color`).trim()) === self.getComputedStyle(this).getPropertyValue('--background-color').trim() || figcaptionBackgroundColor === 'transparent')) {
              this.setAttribute('figcaption-bg-color-equal', true)
            } else {
              this.removeAttribute('figcaption-bg-color-equal')
            }
          })
        }
        this.hidden = false
      })
    }
    this.addEventListener('click', this.clickListener)
    if (this.getAttribute('namespace') === 'teaser-overlay-') {
      this.addEventListener('mouseover', this.mouseoverListener)
      this.addEventListener('mouseout', this.mouseoutListener)
    }
  }

  disconnectedCallback () {
    super.disconnectedCallback()
    this.removeEventListener('click', this.clickListener)
    if (this.getAttribute('namespace') === 'teaser-overlay-') {
      this.removeEventListener('mouseover', this.mouseoverListener)
      this.removeEventListener('mouseout', this.mouseoutListener)
    }
  }

  intersectionCallback (entries, observer) {
    this.classList[entries[0] && entries[0].isIntersecting ? 'add' : 'remove']('intersecting')
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
   * renders the m-Teaser css
   *
   * @return {Promise<void>}
   */
  renderCSS () {
    if (this.getAttribute('namespace') === 'teaser-overlay-' && this.aArrow) this.aArrow.setAttribute('hover-set-by-outside', '')
    this.css = /* css */`
      :host([href]) {
        cursor: pointer;
      }
      :host figure {
        display: var(--display, flex);
        background-color: var(--background-color, #c2262f);
        border-radius: var(--border-radius, 0);
        flex-direction: var(--flex-direction, column);
        align-items: var(--align-items, flex-start);
        justify-content: var(--justify-content, space-between);
        margin: var(--margin, 0);
        padding: var(--padding, 0);
        height: var(--height, 100%);
        width: var(--width, 100%);
        overflow: var(--overflow, visible);
        position: var(--position, static);
        overflow: hidden;
      }
      ${this.getAttribute('namespace') === 'teaser-overlay-'
      ? /* css */`
          :host figure {
            display: grid;
            grid-template-columns: 1fr;
            grid-template-rows: 1fr;
          }
          :host figure a-picture, :host figure figcaption {
            grid-column: 1;
            grid-row: 1;
          }
          :host figure figcaption {
            z-index: 1;
          }
          :host figure figcaption *.bg-color {
            padding-top: 0;
          }
          :host(:hover) figure figcaption * {
            color: var(--bg-color-hover, var(--bg-color, var(--background-color, red)));
            background-color: var(--bg-background-color-hover, var(--color-hover, var(--bg-background-color, var(--color-secondary, green))));
            box-shadow: var(--bg-padding, 0.5em) 0 0 var(--bg-background-color-hover, var(--color-hover, var(--bg-background-color, var(--color-secondary, green)))), calc(0px - var(--bg-padding, 0.5em)) 0 0 var(--bg-background-color-hover, var(--color-hover, var(--bg-background-color, var(--color-secondary, green))));
          }
        `
        : ''}
      :host figure a-picture {
        height: var(--a-picture-height, auto);
        margin: var(--a-picture-margin, 0);
        width: var(--a-picture-width, 100%);
        transition: var(--a-picture-transition, none);
        transform: var(--a-picture-transform, none);
      }
      :host(:hover) figure a-picture {
        transform: var(--a-picture-transform-hover, var(--a-picture-transform, none));
      }
      :host figure figcaption {
        border-radius: var(--figcaption-border-radius, var(--border-radius, 0));
        display: var(--figcaption-display, block);
        flex-direction: var(--figcaption-flex-direction, row);
        justify-content: var(--figcaption-justify-content, normal);
        align-items: var(--figcaption-align-items, normal);
        align-self: var(--figcaption-align-self, auto);
        background-color: var(--figcaption-background-color, #c2262f);
        margin: var(--figcaption-margin, 0);
        padding: var(--figcaption-padding, 1em);
        font-size: var(--figcaption-font-size, 1em);
        flex-grow: var(--figcaption-flex-grow, 1);
        height: var(--figcaption-height, 100%);
        width: var(--figcaption-width, 100%);
        transition: var(--figcaption-transition, none);
        transform: var(--figcaption-transform, none);
      }
      :host(:hover) figure figcaption {
        background-color: var(--figcaption-background-color-hover, var(--figcaption-background-color, #c2262f));
      }
      :host(:hover) figure a-picture ~ figcaption {
        background-color: var(--a-picture-figcaption-background-color-hover, var(--figcaption-background-color-hover, var(--figcaption-background-color, #c2262f)));
      }
      :host([figcaption-bg-color-equal=true]) figure figcaption {
        padding: var(--figcaption-bg-color-equal-padding, var(--figcaption-padding, 1em 0));
      }
      :host(:hover) figure figcaption {
        transform: var(--figcaption-transform-hover, none);
      }
      :host figure figcaption * {
        color: var(--figcaption-color, var(--color, unset));
      }
      :host figure figcaption h2, :host figure figcaption h6 {
        color: var(--h2-figcaption-color, var(--h6-figcaption-color, var(--figcaption-color, var(--color, unset))));
      }
      :host(:hover) figure figcaption * {
        color: var(--figcaption-color-hover, var(--figcaption-color, var(--color, unset)));
      }
      :host(:hover) figure figcaption h2, :host(:hover) figure figcaption h6 {
        color: var(--h2-figcaption-color-hover, var(--h6-figcaption-color-hover, var(--figcaption-color-hover, var(--h2-figcaption-color, var(--h6-figcaption-color, var(--figcaption-color, var(--color, unset)))))));
      }
      :host figure figcaption > * {
        transition: var(--figcaption-any-transition, none);
        transform: var(--figcaption-any-transform, none);
        transform-origin: var(--figcaption-any-transform-origin, unset);
        opacity: var(--figcaption-any-opacity, 1);
      }
      :host(.intersecting) figure figcaption > * {
        transition: var(--intersecting-figcaption-any-transition, var(--figcaption-any-transition, color 0.3s ease-out));
        transform: var(--intersecting-figcaption-any-transform, var(--figcaption-any-transform, none));
        opacity: var(--intersecting-figcaption-any-opacity, var(--figcaption-any-opacity, 1));
      }
      :host figure figcaption a-link, :host(.intersecting) figure figcaption a-link {
        position: var(--a-link-position, static);
        top: var(--a-link-top, auto);
        bottom: var(--a-link-bottom, auto);
        transition: var(--a-link-transition, none);
        transform: var(--a-link-transform, none);
        opacity: var(--a-link-opacity, 1);
      }
      :host(:hover) figure figcaption a-link {
        transform: var(--a-link-transform-hover, none);
        opacity: var(--a-link-opacity-hover, 1);
      }
      @media only screen and (max-width: _max-width_) {
        :host figure {
          border-radius: var(--border-radius-mobile, var(--border-radius, 0));
        }
        :host figure figcaption {
          border-radius: var(--figcaption-border-radius-mobile, var(--border-radius-mobile, var(--figcaption-border-radius, var(--border-radius, 0))));
        }
      }
    `
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
      case 'teaser-tile-':
        return this.fetchCSS([{
          path: `${import.meta.url.replace(/(.*\/)(.*)$/, '$1')}./tile-/tile-.css`, // apply namespace since it is specific and no fallback
          namespace: false
        }, ...styles], false)
      case 'teaser-tile-text-center-':
        return this.fetchCSS([{
          path: `${import.meta.url.replace(/(.*\/)(.*)$/, '$1')}./tile-/tile-.css`, // apply namespace since it is specific and no fallback
          namespace: false
        }, {
          path: `${import.meta.url.replace(/(.*\/)(.*)$/, '$1')}./tile-text-center-/tile-text-center-.css`, // apply namespace since it is specific and no fallback
          namespace: false
        }, ...styles], false).then(fetchCSSParams => {
          // harmonize the tile-.css namespace with teaser-tile-text-center-
          fetchCSSParams[0].styleNode.textContent = fetchCSSParams[0].styleNode.textContent.replace(/--teaser-tile-/g, '--teaser-tile-text-center-')
        })
      case 'teaser-tile-rounded-':
        return this.fetchCSS([{
          path: `${import.meta.url.replace(/(.*\/)(.*)$/, '$1')}./tile-/tile-.css`, // apply namespace since it is specific and no fallback
          namespace: false
        }, {
          path: `${import.meta.url.replace(/(.*\/)(.*)$/, '$1')}./tile-rounded-/tile-rounded-.css`, // apply namespace since it is specific and no fallback
          namespace: false
        }, ...styles], false).then(fetchCSSParams => {
          // harmonize the tile-.css namespace with teaser-tile-rounded-
          fetchCSSParams[0].styleNode.textContent = fetchCSSParams[0].styleNode.textContent.replace(/--teaser-tile-/g, '--teaser-tile-rounded-')
        })
      case 'teaser-overlay-':
        return this.fetchCSS([{
          path: `${import.meta.url.replace(/(.*\/)(.*)$/, '$1')}./overlay-/overlay-.css`, // apply namespace since it is specific and no fallback
          namespace: false
        }, ...styles], false)
      case 'teaser-download-':
        return this.fetchCSS([{
          path: `${import.meta.url.replace(/(.*\/)(.*)$/, '$1')}./download-/download-.css`, // apply namespace since it is specific and no fallback
          namespace: false
        }, ...styles], false)
      case 'teaser-round-':
        return this.fetchCSS([{
          path: `${import.meta.url.replace(/(.*\/)(.*)$/, '$1')}./round-/round-.css`, // apply namespace since it is specific and no fallback
          namespace: false
        }, ...styles], false)
      case 'teaser-plain-':
        return this.fetchCSS([{
          path: `${import.meta.url.replace(/(.*\/)(.*)$/, '$1')}./plain-/plain-.css`, // apply namespace since it is specific and no fallback
          namespace: false
        }, ...styles], false)
      default:
        return this.fetchCSS(styles, false)
    }
  }

  get aPicture () {
    return this.root.querySelector('a-picture')
  }

  get aArrow () {
    return this.root.querySelector('a-arrow')
  }
}
