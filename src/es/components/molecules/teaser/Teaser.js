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
    super({
      importMetaUrl: import.meta.url,
      intersectionObserverInit: { rootMargin: '0px 0px 0px 0px' },
      ...options
    }, ...args)

    this.setAttribute('role', 'figure')
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
    this.hidden = true
    const showPromises = []
    if (this.shouldRenderCSS()) showPromises.push(this.renderCSS())
    if (this.aPicture && this.aPicture.hasAttribute('picture-load') && !this.aPicture.hasAttribute('loaded')) showPromises.push(new Promise(resolve => this.addEventListener('picture-load', event => resolve(), { once: true })))
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
      this.checkIfLink()
      this.hidden = false
    })
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
  shouldRenderCSS () {
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
      :host {
        max-width: 100%;
      }
      :host([href]) {
        cursor: pointer;
      }
      :host figure {
        display: var(--display, flex);
        background-color: var(--background-color, transparent);
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
      :host figure a-picture, :host figure m-picture-with-picture {
        height: var(--a-picture-height, auto);
        margin: var(--a-picture-margin, 0);
        width: var(--a-picture-width, 100%);
        transition: var(--a-picture-transition, none);
        transform: var(--a-picture-transform, none);
      }
      :host(:hover) figure a-picture, :host(:hover) figure m-picture-with-picture {
        transform: var(--a-picture-transform-hover, var(--a-picture-transform, none));
      }
      :host figure figcaption {
        border-radius: var(--figcaption-border-radius, var(--border-radius, 0));
        display: var(--figcaption-display, block);
        flex-direction: var(--figcaption-flex-direction, row);
        justify-content: var(--figcaption-justify-content, normal);
        align-items: var(--figcaption-align-items, normal);
        align-self: var(--figcaption-align-self, auto);
        background-color: var(--figcaption-background-color, transparent);
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
        background-color: var(--figcaption-background-color-hover, var(--figcaption-background-color, transparent));
      }
      :host(:hover) figure a-picture ~ figcaption, :host(:hover) figure m-picture-with-picture ~ figcaption {
        background-color: var(--a-picture-figcaption-background-color-hover, var(--figcaption-background-color-hover, var(--figcaption-background-color, transparent)));
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
        transition: var(--intersecting-figcaption-any-transition, var(--figcaption-any-transition, color 0.3s ease-out, background-color 0.3s ease-out, box-shadow 0.3s ease-out));
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
    return this.fetchTemplate()
  }

  /**
   * fetches the template
   *
   * @return {Promise<void>}
   */
  fetchTemplate () {
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
      case 'teaser-tile-':
        return this.fetchCSS([{
          path: `${this.importMetaUrl}./tile-/tile-.css`, // apply namespace since it is specific and no fallback
          namespace: false
        }, ...styles], false)
      case 'teaser-tile-text-center-':
        return this.fetchCSS([{
          path: `${this.importMetaUrl}./tile-/tile-.css`, // apply namespace since it is specific and no fallback
          namespace: false,
          replaces: [{
            pattern: '--teaser-tile-',
            flags: 'g',
            replacement: '--teaser-tile-text-center-'
          }]
        }, {
          path: `${this.importMetaUrl}./tile-text-center-/tile-text-center-.css`, // apply namespace since it is specific and no fallback
          namespace: false
        }, ...styles], false)
      case 'teaser-tile-rounded-':
        return this.fetchCSS([{
          path: `${this.importMetaUrl}./tile-/tile-.css`, // apply namespace since it is specific and no fallback
          namespace: false,
          // harmonize the tile-.css namespace with teaser-tile-rounded-
          replaces: [{
            pattern: '--teaser-tile-',
            flags: 'g',
            replacement: '--teaser-tile-rounded-'
          }]
        }, {
          path: `${this.importMetaUrl}./tile-rounded-/tile-rounded-.css`, // apply namespace since it is specific and no fallback
          namespace: false
        }, ...styles], false)
      case 'teaser-overlay-':
        return this.fetchCSS([{
          path: `${this.importMetaUrl}./overlay-/overlay-.css`, // apply namespace since it is specific and no fallback
          namespace: false
        }, ...styles], false)
      case 'teaser-overlay-top-':
        return this.fetchCSS([{
          path: `${this.importMetaUrl}./overlay-top-/overlay-top-.css`, // apply namespace since it is specific and no fallback
          namespace: false
        }, ...styles], false)
      case 'teaser-download-':
        return this.fetchCSS([{
          path: `${this.importMetaUrl}./download-/download-.css`, // apply namespace since it is specific and no fallback
          namespace: false
        }, ...styles], false)
      case 'teaser-round-':
        return this.fetchCSS([{
          path: `${this.importMetaUrl}./round-/round-.css`, // apply namespace since it is specific and no fallback
          namespace: false
        }, ...styles], false)
      case 'teaser-plain-':
        return this.fetchCSS([{
          path: `${this.importMetaUrl}./plain-/plain-.css`, // apply namespace since it is specific and no fallback
          namespace: false
        }, ...styles], false)
      case 'teaser-plainer-':
        return this.fetchCSS([{
          path: `${this.importMetaUrl}./plainer-/plainer-.css`, // apply namespace since it is specific and no fallback
          namespace: false
        }, ...styles], false)
      default:
        return this.fetchCSS(styles, false)
    }
  }

  checkIfLink () {
    // accessible and seo conform a tag wrapped around this component
    if (this.hasAttribute('href') && this.parentNode) {
      const a = document.createElement('a')
      Array.from(this.attributes).forEach(attribute => {
        if (!attribute.name.includes('hidden')) a.setAttribute(attribute.name, attribute.value)
      })
      if (a.hasAttribute('id')) this.removeAttribute('id')
      a.setAttribute('wrapper', '')
      a.style.color = 'inherit'
      a.style.textDecoration = 'inherit'
      this.parentNode.replaceChild(a, this)
      a.appendChild(this)
      this.checkIfLink = () => {}
    }
  }

  get aPicture () {
    return this.root.querySelector('a-picture')
  }

  get aArrow () {
    return this.root.querySelector('a-arrow')
  }
}
