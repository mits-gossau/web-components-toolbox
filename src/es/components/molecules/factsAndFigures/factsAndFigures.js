import { Shadow } from '../../prototypes/Shadow.js'

export default class SustainabilityMetrics extends Shadow() {
  constructor (options = {}, ...args) {
    super({ importMetaUrl: import.meta.url, ...options }, ...args)
  }

  connectedCallback () {
    if (this.shouldRenderCSS()) this.renderCSS()
    if (this.getAttribute('defaultSource')) {
      const currentDefaultSource = this.getAttribute('defaultSource')
      this.backgroundPicture.setAttribute('defaultSource', currentDefaultSource)
      this.backgroundPicture.style = `background-image: url(${currentDefaultSource}); background-size: cover; background-position: center;`
      this.backgroundOverlay.style.display = 'block'
      this.style = '--facts-and-figures-default-text-color-custom: white;'
    }
    else {
      this.style = '--facts-and-figures-default-text-color-custom: black;'
    }

  }

  shouldRenderCSS () {
    return !this.root.querySelector(`:host > style[_css], ${this.tagName} > style[_css]`)
  }

  renderCSS () {
    this.css = /* css */`
    :host {
        overflow: var(--overflow, hidden);
        border-radius: var(--border-radius, 0.5em);
        width: var(--width, 100%);
        height: var(--height, 20em);
        display: var(--display, flex);
        justify-content: var(--justify-content, center);
        align-items: var(--align-items, center);
        position: var(--position, relative);
    }

    :host p{
        color: var(--text-color, var(--color-tertiary, black));
    }
    :host .background{
        height: var(--background-height, 100%);
        width: var(--background-width, 100%);
        position: var(--background-position, absolute);
        z-index: var(--background-z-index, 1);
    }

    :host .number-percentage{
      font-size: var(--number-percentage-font-size, 1.75em);
      margin: var(--number-percentage-margin, 0);
      font-family: var(--number-percentage-font-family, var(--font-family, 'Arial', sans-serif));
    }

    .background-overlay {
        display: var(--background-overlay-display, none);
        position: var(--background-overlay-position, absolute);
        top: var(--background-overlay-top, 0);
        left: var(--background-overlay-left, 0);
        right: var(--background-overlay-right, 0);
        bottom: var(--background-overlay-bottom, 0);
        background-color: var(--background-overlay-background-color, rgba(0, 0, 0, 0.5)); 
        z-index: var(--background-overlay-z-index, 2);
        border-radius: var(--background-overlay-border-radius, 5px);
    }

    :host .numbers{
        display: var(--numbers-display, flex);
        justify-content: var(--numbers-justify-content, space-around);
        align-items: var(--numbers-align-items, center);
        position: var(--numbers-position, relative);
        width: var(--numbers-width, 100%);
        height: var(--numbers-height, 100%);
        z-index: var(--numbers-z-index, 2);
    }

    :host .numbers .number{
        margin: 1em 0;
        display: var(--numbers-number-display, flex);
        flex-direction: var(--numbers-number-flex-direction, column);
        align-items: var(--numbers-number-align-items, center);
        min-width: var(--numbers-number-min-width, ${100 / this.numbersContainer.length}%);
        
    }

    :host .numbers .number .icon{
        width: var(--numbers-number-icon-width, 5em);
        margin: 0 0 1em 0;
    }

    @media only screen and (max-width: _max-width_) {
        .numbers{
            flex-direction: var(--numbers-flex-direction-mobile, column);
            padding-top: var(--numbers-padding-top-mobile, 1em);
            padding-bottom: var(--numbers-padding-bottom-mobile, 1em);
        }
        :host{
            height: var(--height-mobile, fit-content);        
        }
    }`
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
      case 'facts-and-figures-default-':
        return this.fetchCSS([{
          path: `${this.importMetaUrl}./default-/default-.css`, // apply namespace since it is specific and no fallback
          namespace: false
        }, ...styles])
      default:
        return this.fetchCSS(styles)
    }
  }

  get backgroundPicture () {
    return this.root.querySelector('.background')
  }

  get backgroundOverlay () {
    return this.root.querySelector('.background-overlay')
  }

  get numbersContainer () {
    return this.root.querySelectorAll('.numbers > *')
  }
}
