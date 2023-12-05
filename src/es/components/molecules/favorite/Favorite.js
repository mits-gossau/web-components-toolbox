// @ts-check
import { Shadow } from '../../prototypes/Shadow.js'

/**
* @export
* @class Favorite
* @type {CustomElementConstructor}
*/
export default class Favorite extends Shadow() {
  constructor (options = {}, ...args) {
    super({ importMetaUrl: import.meta.url, ...options }, ...args)

    this.isActive = false

    this.answerEventNameListener = event => {
      event.detail.fetch.then(data => {
        this.isActive = data?.requestSuccess
        this.setCss(/* CSS */`
          a-tooltip::part(tooltip) {
            fill: ${this.isActive ? 'var(--svg-fill-active)' : 'var(--svg-fill-default)'};
          } 
        `)
      }).catch(error => console.warn(error))
    }

    this.clickListener = () => {
      this.dispatchEvent(new CustomEvent(this.getAttribute('request-favorite-event-name') || 'request-favorite-event-name',
        {
          detail: {
            id: this.id
          },
          bubbles: true,
          cancelable: true,
          composed: true
        }
      ))
    }
  }

  connectedCallback () {
    document.body.addEventListener(this.getAttribute('answer-event-name') || 'answer-event-name', this.answerEventNameListener)
    if (this.shouldRenderCSS()) this.renderCSS()
    if (this.shouldRenderHTML()) this.renderHTML()
    this.icon.addEventListener('click', this.clickListener)
    this.dispatchEvent(new CustomEvent(this.getAttribute('request-favorite-event-name') || 'request-favorite-event-name',
      {
        detail: {
          id: this.id
        },
        bubbles: true,
        cancelable: true,
        composed: true
      }
    ))
  }

  disconnectedCallback () {
    document.body.removeEventListener(this.getAttribute('answer-event-name') || 'answer-event-name', this.answerEventNameListener)
    this.icon.removeEventListener('click', this.clickListener)
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
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldRenderHTML () {
    return !this.icon
  }

  /**
   * renders the css
   */
  renderCSS () {
    this.css = /* css */`
      a-tooltip::part(tooltip) {
        fill: ${this.isActive ? 'var(--svg-fill-active)' : 'var(--svg-fill-default)'};
        stroke:var(--svg-stroke, black);
      }
      a-tooltip::part(tooltip):hover {
        cursor: pointer;
        stroke: var(--svg-stroke-hover, green);
      }
      @media only screen and (max-width: _max-width_) {
        :host {}
      }
    `
    return this.fetchTemplate()
  }

  /**
   * fetches the template
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
      case 'favorite-default-':
        return this.fetchCSS([{
          path: `${this.importMetaUrl}./default-/default-.css`, // apply namespace since it is specific and no fallback
          namespace: false
        }, ...styles])
      default:
        return this.fetchCSS(styles)
    }
  }

  /**
   * Render HTML
   * @returns void
   */
  renderHTML () {
    const tooltipText = this.isActive ? this.removeFromFavoriteText : this.addToFavoriteText
    this.fetchModules([
      {
        path: `${this.importMetaUrl}'../../../../atoms/tooltip/Tooltip.js`,
        name: 'a-tooltip'
      }
    ])
    this.html = /* html */ `
      <a-tooltip width="12" text-align="center">
          <div class="tooltip">
              <svg width="24" height="24" viewBox="0 0 24 24" part="tooltip">
                <path
                  d="M20.84 5.61183C20.3292 5.10083 19.7228 4.69547 19.0554 4.41891C18.3879 4.14235 17.6725 4 16.95 4C16.2275 4 15.5121 4.14235 14.8446 4.41891C14.1772 4.69547 13.5708 5.10083 13.06 5.61183L12 6.67183L10.94 5.61183C9.9083 4.58013 8.50903 4.00053 7.05 4.00053C5.59096 4.00053 4.19169 4.58013 3.16 5.61183C2.1283 6.64352 1.54871 8.04279 1.54871 9.50183C1.54871 10.9609 2.1283 12.3601 3.16 13.3918L12 22.2318L20.84 13.3918C21.351 12.8811 21.7563 12.2746 22.0329 11.6072C22.3095 10.9397 22.4518 10.2243 22.4518 9.50183C22.4518 8.77934 22.3095 8.06393 22.0329 7.39647C21.7563 6.72901 21.351 6.12258 20.84 5.61183Z"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
              <span class="tooltip-text">${tooltipText}</span>
          </div>
      </a-tooltip>
      `
  }

  get icon () {
    return this.root.querySelector('svg')
  }

  get id () {
    return this.getAttribute('id')
  }

  get addToFavoriteText () {
    return this.getAttribute('add-to-favorite-text') || 'Add to favorites'
  }

  get removeFromFavoriteText () {
    return this.getAttribute('remove-from-favorite-text') || 'Remove from favorites'
  }
}
