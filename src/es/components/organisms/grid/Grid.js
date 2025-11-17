// @ts-check

import { Shadow } from '../../prototypes/Shadow.js'

/**
 * Grid
 *
 * @export
 * @class Grid
 * @type {CustomElementConstructor}
 * @attribute {}
 * @css {}
 */
export default class Grid extends Shadow() {
  constructor (options = {}, ...args) {
    super({ importMetaUrl: import.meta.url, tabindex: 'no-tabindex', ...options }, ...args)
  }

  connectedCallback () {
    this.hidden = true
    const showPromises = []
    if (this.shouldRenderCSS()) showPromises.push(this.renderCSS())
    if (this.shouldRenderHTML()) showPromises.push(this.renderHTML())
    if (this.hasAttribute('picture-load')) showPromises.push(/** @type {Promise<void>} */(new Promise(resolve => this.addEventListener('picture-load', event => resolve(), { once: true }))))
    Promise.all(showPromises).then(() => (this.hidden = false))
    return showPromises
  }

  /**
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldRenderCSS () {
    return !this.root.querySelector(`${this.cssSelector} > style[_css]`)
  }

  /**
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldRenderHTML () {
    return !this.grid
  }

  /**
   * renders the o-grid css
   *
   * @return {Promise<void>}
   */
  renderCSS () {
    let css = /* css */`
      :host > section {
        display:grid;
          ${this.hasAttribute('height')
            ? `height: ${this.getAttribute('height') || 'var(--height, 100%)'};`
            : ''
          }
      }
      :host > section > * {
        background: var(--section-child-background, none);
        color: var(--section-child-color, var(--color, black));
        margin: var(--section-child-margin, 0);
        padding: var(--section-child-padding, 0);
      }
    `
    if (this.hasAttribute('overflow')) {
      css += /* css */`
        :host > section {
          overflow: ${this.getAttribute('overflow') || 'var(--overflow, auto)'};
        }
      `
    }
    if (this.hasAttribute('width')) {
      css += /* css */`
        :host {
          width: ${this.getAttribute('width') || 'var(--width, auto)'} !important;
        }
      `
    }
    if (this.hasAttribute('auto-fit')) {
      css += /* css */`
        :host > section {
          grid-template-columns: repeat(auto-fit, minmax(${this.getAttribute('auto-fit') || 'var(--auto-fit-grid-template-columns, 12.5em)'}, 1fr));
          grid-template-rows: var(--auto-fit-grid-template-rows, auto);
        }
      `
    }
    if (this.hasAttribute('auto-fill')) {
      css += /* css */`
        :host > section {
          grid-template-columns: repeat(auto-fill, minmax(${this.getAttribute('auto-fill') || 'var(--auto-fill-grid-template-columns, 12.5em)'}, 1fr));
          grid-template-rows: var(--auto-fill-grid-template-rows, auto);
        }
      `
    }
    if (this.hasAttribute('gap')) {
      css += /* css */`
        :host > section {
          gap: ${this.getAttribute('gap') || 'var(--gap, 0)'};
        }
      `
    }
    if (this.hasAttribute('margin')) {
      css += /* css */`
        :host > section {
          margin: ${this.getAttribute('margin') || 'var(--margin, 0)'};
        }
      `
    }
    if (this.hasAttribute('padding')) {
      css += /* css */`
        :host > section {
          padding: ${this.getAttribute('padding') || 'var(--padding, 0)'};
        }
      `
    }
    if (this.hasAttribute('background')) {
      css += /* css */`
        :host > section {
          background: ${this.getAttribute('background') || 'var(--background, none)'};
        }
      `
    }
    if (this.hasAttribute('color')) {
      css += /* css */`
        :host > section {
          color: ${this.getAttribute('color') || 'var(--color, black)'};
        }
      `
    }
    // mobile
    css += '@media only screen and (max-width: _max-width_) {'
    css += /* css */`
      :host > section > * {
        background: var(--section-child-background-mobile, var(--section-child-background, none));
        color: var(--section-child-color-mobile, var(--section-child-color, var(--color, black)));
        margin: var(--section-child-margin-mobile, var(--section-child-margin, 0));
        padding: var(--section-child-padding-mobile, var(--section-child-padding, 0));
      }
    `
    if (this.hasAttribute('height-mobile')) {
      css += /* css */`
        :host > section {
          height: ${this.getAttribute('height-mobile') || 'var(--height-mobile, var(--height, 100%))'};
        }
      `
    }
    if (this.hasAttribute('overflow-mobile')) {
      css += /* css */`
        :host > section {
          overflow: ${this.getAttribute('overflow-mobile') || 'var(--overflow-mobile, var(--overflow, auto))'};
        }
      `
    }
    if (this.hasAttribute('width-mobile')) {
      css += /* css */`
        :host {
          width: ${this.getAttribute('width-mobile') || 'var(--width-mobile, var(--width, auto))'} !important;
        }
      `
    }
    if (this.hasAttribute('auto-fit-mobile')) {
      css += /* css */`
        :host > section {
          grid-template-columns: repeat(auto-fit, minmax(${this.getAttribute('auto-fit-mobile') || 'var(--auto-fit-grid-template-columns-mobile, var(--auto-fit-grid-template-columns, 12.5em))'}, 1fr));
          grid-template-rows: var(--auto-fit-grid-template-rows-mobile, var(--auto-fit-grid-template-rows, auto));
        }
      `
    }
    if (this.hasAttribute('auto-fill-mobile')) {
      css += /* css */`
        :host > section {
          grid-template-columns: repeat(auto-fill, minmax(${this.getAttribute('auto-fill-mobile') || 'var(--auto-fill-grid-template-columns-mobile, var(--auto-fill-grid-template-columns, 12.5em))'}, 1fr));
          grid-template-rows: var(--auto-fill-grid-template-rows-mobile, var(--auto-fill-grid-template-rows, auto));
        }
      `
    }
    if (this.hasAttribute('gap-mobile')) {
      css += /* css */`
        :host > section {
          gap: ${this.getAttribute('gap-mobile') || 'var(--gap-mobile, var(--gap, 0))'};
        }
      `
    }
    if (this.hasAttribute('margin-mobile')) {
      css += /* css */`
        :host > section {
          margin: ${this.getAttribute('margin-mobile') || 'var(--margin-mobile, var(--margin, 0))'};
        }
      `
    }
    if (this.hasAttribute('padding-mobile')) {
      css += /* css */`
        :host > section {
          padding: ${this.getAttribute('padding-mobile') || 'var(--padding-mobile, var(--padding, 0))'};
        }
      `
    }
    if (this.hasAttribute('background-mobile')) {
      css += /* css */`
        :host > section {
          background: ${this.getAttribute('background-mobile') || 'var(--background-mobile, var(--background, none))'};
        }
      `
    }
    if (this.hasAttribute('color-mobile')) {
      css += /* css */`
        :host > section {
          color: ${this.getAttribute('color-mobile') || 'var(--color-mobile, var(--color, black))'};
        }
      `
    }
    css += '}'
    this.css = css
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
      case 'grid-1column-align-center-':
        return this.fetchCSS([{
          path: `${this.importMetaUrl}./1column-align-center-/1column-align-center-.css`, // apply namespace since it is specific and no fallback
          namespace: false
        }, ...styles], false).then(fetchCSSParams => {
          // make template ${code} accessible aka. set the variables in the literal string
          fetchCSSParams[0].styleNode.textContent = eval('`' + fetchCSSParams[0].style + '`')// eslint-disable-line no-eval
        })
      case 'grid-2columns-content-section-':
        return this.fetchCSS([{
          path: `${this.importMetaUrl}./2columns-content-section-/2columns-content-section-.css`, // apply namespace since it is specific and no fallback
          namespace: false
        }, ...styles], false).then(fetchCSSParams => {
          // make template ${code} accessible aka. set the variables in the literal string
          fetchCSSParams[0].styleNode.textContent = eval('`' + fetchCSSParams[0].style + '`')// eslint-disable-line no-eval
        })
      case 'grid-2columns-content-stage-':
        return this.fetchCSS([{
          path: `${this.importMetaUrl}./2columns-content-stage-/2columns-content-stage-.css`, // apply namespace since it is specific and no fallback
          namespace: false
        }, ...styles], false).then(fetchCSSParams => {
          // make template ${code} accessible aka. set the variables in the literal string
          fetchCSSParams[0].styleNode.textContent = eval('`' + fetchCSSParams[0].style + '`')// eslint-disable-line no-eval
        })
      case 'grid-2colums2rows-':
        return this.fetchCSS([{
          path: `${this.importMetaUrl}./2colums2rows-/2colums2rows-.css`, // apply namespace since it is specific and no fallback
          namespace: false
        }, ...styles], false).then(fetchCSSParams => {
          // make template ${code} accessible aka. set the variables in the literal string
          fetchCSSParams[0].styleNode.textContent = eval('`' + fetchCSSParams[0].style + '`')// eslint-disable-line no-eval
        })
      case 'grid-432-auto-colums-auto-rows-':
        return this.fetchCSS([{
          path: `${this.importMetaUrl}./432-auto-colums-auto-rows-/432-auto-colums-auto-rows-.css`, // apply namespace since it is specific and no fallback
          namespace: false
        }, ...styles], false).then(fetchCSSParams => {
          // make template ${code} accessible aka. set the variables in the literal string
          fetchCSSParams[0].styleNode.textContent = eval('`' + fetchCSSParams[0].style + '`')// eslint-disable-line no-eval
        })
      case 'grid-4columns-':
        return this.fetchCSS([{
          path: `${this.importMetaUrl}./4columns-/4columns-.css`, // apply namespace since it is specific and no fallback
          namespace: false
        }, ...styles], false).then(fetchCSSParams => {
          // make template ${code} accessible aka. set the variables in the literal string
          fetchCSSParams[0].styleNode.textContent = eval('`' + fetchCSSParams[0].style + '`')// eslint-disable-line no-eval
        })
      case 'grid-12er-':
        return this.fetchCSS([{
          path: `${this.importMetaUrl}./12er-/12er-.css.js`, // apply namespace since it is specific and no fallback
          namespace: false
        }, ...styles], false).then(fetchCSSParams => {
          // make template ${code} accessible aka. set the variables in the literal string
          fetchCSSParams[0].styleNode.textContent = eval(fetchCSSParams[0].style)// eslint-disable-line no-eval
        })
      case 'grid-x-':
        return this.fetchCSS([{
          path: `${this.importMetaUrl}./x-columns-/x-columns-.css.js`, // apply namespace since it is specific and no fallback
          namespace: false
        }, ...styles], false).then(fetchCSSParams => {
          // make template ${code} accessible aka. set the variables in the literal string
          fetchCSSParams[0].styleNode.textContent = eval(fetchCSSParams[0].style)// eslint-disable-line no-eval
        })
      default:
        return this.fetchCSS(styles, false)
    }
  }

  /**
   * renders the html
   *
   * @return {Promise<void>}
   */
  renderHTML () {
    this.section = this.root.querySelector(this.cssSelector + ' > section') || document.createElement('section')
    Array.from(this.root.children).forEach(node => {
      if (node.tagName !== 'STYLE' && node.tagName !== 'SECTION') this.section.appendChild(node)
    })
    this.setAttribute('count-section-children', this.section.children.length)
    let css = ''
    let cssMobile = '@media only screen and (max-width: _max-width_) {'
    Array.from(this.section.children).forEach(node => {
      if ((node.getAttribute('style') || '').includes('background')) node.setAttribute('has-background', 'true')
      if (node.getAttribute('grid-column') && !css.includes(`[grid-column="${node.getAttribute('grid-column')}"]`)) {
        css += /* css */`
          :host > section > [grid-column="${node.getAttribute('grid-column')}"]{
            grid-column: ${node.getAttribute('grid-column')};
          }
        `
      }
      if (node.getAttribute('grid-row') && !css.includes(`[grid-row="${node.getAttribute('grid-row')}"]`)) {
        css += /* css */`
          :host > section > [grid-row="${node.getAttribute('grid-row')}"]{
            grid-row: ${node.getAttribute('grid-row')};
          }
        `
      }
      if (node.getAttribute('margin') && !css.includes(`[margin="${node.getAttribute('margin')}"]`)) {
        css += /* css */`
          :host > section > [margin="${node.getAttribute('margin')}"]{
            margin: ${node.getAttribute('margin')};
          }
        `
      }
      if (node.getAttribute('padding') && !css.includes(`[padding="${node.getAttribute('padding')}"]`)) {
        css += /* css */`
          :host > section > [padding="${node.getAttribute('padding')}"]{
            padding: ${node.getAttribute('padding')};
          }
        `
      }
      if (node.getAttribute('background') && !css.includes(`[background="${node.getAttribute('background')}"]`)) {
        css += /* css */`
          :host > section > [background="${node.getAttribute('background')}"]{
            background: ${node.getAttribute('background')};
          }
        `
      }
      if (node.getAttribute('color') && !css.includes(`[color="${node.getAttribute('color')}"]`)) {
        css += /* css */`
          :host > section > [color="${node.getAttribute('color')}"]{
            color: ${node.getAttribute('color')};
          }
        `
      }
      // mobile
      if (node.getAttribute('grid-column-mobile') && !cssMobile.includes(`[grid-column-mobile="${node.getAttribute('grid-column-mobile')}"]`)) {
        cssMobile += /* css */`
          :host > section > [grid-column-mobile="${node.getAttribute('grid-column-mobile')}"]{
            grid-column: ${node.getAttribute('grid-column-mobile')};
          }
        `
      }
      if (node.getAttribute('grid-row-mobile') && !cssMobile.includes(`[grid-row-mobile="${node.getAttribute('grid-row-mobile')}"]`)) {
        cssMobile += /* css */`
          :host > section > [grid-row-mobile="${node.getAttribute('grid-row-mobile')}"]{
            grid-row: ${node.getAttribute('grid-row-mobile')};
          }
        `
      }
      if (node.getAttribute('margin-mobile') && !cssMobile.includes(`[margin-mobile="${node.getAttribute('margin-mobile')}"]`)) {
        cssMobile += /* css */`
          :host > section > [margin-mobile="${node.getAttribute('margin-mobile')}"]{
            margin: ${node.getAttribute('margin-mobile')};
          }
        `
      }
      if (node.getAttribute('padding-mobile') && !cssMobile.includes(`[padding-mobile="${node.getAttribute('padding-mobile')}"]`)) {
        cssMobile += /* css */`
          :host > section > [padding-mobile="${node.getAttribute('padding-mobile')}"]{
            padding: ${node.getAttribute('padding-mobile')};
          }
        `
      }
      if (node.getAttribute('background-mobile') && !cssMobile.includes(`[background-mobile="${node.getAttribute('background-mobile')}"]`)) {
        cssMobile += /* css */`
          :host > section > [background-mobile="${node.getAttribute('background-mobile')}"]{
            background: ${node.getAttribute('background-mobile')};
          }
        `
      }
      if (node.getAttribute('color-mobile') && !cssMobile.includes(`[color-mobile="${node.getAttribute('color-mobile')}"]`)) {
        cssMobile += /* css */`
          :host > section > [color-mobile="${node.getAttribute('color-mobile')}"]{
            color: ${node.getAttribute('color-mobile')};
          }
        `
      }
    })
    cssMobile += '}'
    this.setCss(css + cssMobile, undefined, false, undefined, this._css, false)
    this.html = [this.section]
    return Promise.resolve()
  }
}
