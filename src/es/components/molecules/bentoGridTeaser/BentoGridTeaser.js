import { Shadow } from '../../prototypes/Shadow.js'
export default class BentoGridTeaser extends Shadow() {
  constructor (options = {}, ...args) {
      super({ importMetaUrl: import.meta.url, tabindex: 'no-tabindex', ...options }, ...args)
  }

  connectedCallback () {
    if (this.shouldRenderCSS()) this.renderCSS()
  }

  shouldRenderCSS () {
    return !this.root.querySelector(`:host > style[_css], ${this.tagName} > style[_css]`)
  }

  renderCSS () {
    this.css = /* css */`
    :host {
        width: var(--width, 100vw);
        height: var(--height, fit-content);
    }
    .image{
        border-radius: var(--image-border-radius, 0.5em);
    }

    .column-left {
        height: var(--column-left-height, 100%);
    }
    
    .higher {
        height: var(--higher-height, 40%);
    }
    
    .lower {
        height: var(--lower-height, 35%);
    }
    
    .longer {
        width: var(--longer-width, 60%);
    }
    
    .shorter {
        width: var(--shorter-width, 40%);
    }
    
    .same {
        width: var(--same-width, 50%);
    }
    
    .teaser-container {
        color: var(--teaser-container-color, white);
        height: fit-content;
        width: var(--teaser-container-width, 100%);
        display: flex;
        flex-direction: column;
        gap: var(--teaser-container-gap, 1em);

    }

    .sub {
        display: flex;
        justify-content: center;
        align-items: center;
        width: var(--sub-width, 100%);
        background-position: center;
        background-size: cover;
        position: relative;
        overflow: hidden;
    }
    
    .sub a-picture {
        width: var(--sub-a-picture-width, 100%);
        height: var(--sub-a-picture-height, 100%);
        position: absolute;
        object-fit: cover;
        top: 0;
        left: 0;
    }
    .img {
        height: var(--img-height, 100%);
    }        
    .title {
        font-size: var(--title-font-size, x-large);
        position: relative;
        z-index: 1;
        text-shadow: var(--title-text-shadow, 1px 3px 12px black);
    }  
    
    .row {
        width: var(--row-width, 100%);
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        gap: var(--row-gap, 1em);
        height: var(--row-height, 30vw);
    }
    .big-image {
        height: var(--big-image-height, 100%);
        box-sizing: border-box;
        background: none;
    }
    .column-right {
        height: var(--column-right-height, 100%);
        display: flex;
        flex-direction: column;
        gap: var(--column-right-gap, 1em);
    }
    .small-image {
        height: var(--small-image-height, 50%);
        box-sizing: border-box;
        background: none;
    }
    .image a-picture, .title{
        transition: var(--transition-duration, 0.5s);

    }
    
    .image:hover {
        cursor: pointer;
        opacity: 1;
    
    }

    .image:hover .title{
        color: var(--image-color-hover, rgb(214, 169, 88));

    }
    
    .image:hover a-picture {
        filter: grayscale(100%);

    }

    a{
        text-decoration-line: var(--link-decoration-line, none);
        color: var(--link-color, white);
    }

    @media only screen and (max-width: _max-width_){
        .title{
            font-size: var(--mobile-title-font-size, large);
            text-align: center;
        }
        .image{
            border-radius: var(--mobile-image-border-radius, 0.3em);
        }

        .teaser-container {
            gap: var(--mobile-teaser-container-gap, 0.7em);

        }
        .row {
            gap: var(--mobile-row-gap, 0.7em);
            height: var(--mobile-row-height, 50vw);
        }

        .teaser-container {
            gap: var(--mobile-teaser-container-gap, 0.7em);
        }
        .column-right {
            gap: var(--mobile-column-right-gap, 0.7em);
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
      case 'bento-grid-teaser-default-':
        return this.fetchCSS([{
          path: `${this.importMetaUrl}./default-/default-.css`, // apply namespace since it is specific and no fallback
          namespace: false
        }, ...styles])
      default:
        return this.fetchCSS(styles)
    }
  }
}
