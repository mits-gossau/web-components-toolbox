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
    super({ importMetaUrl: import.meta.url, ...options }, ...args)
  }

  connectedCallback () {
    this.hidden = true
    const showPromises = []
    if (this.shouldRenderCSS()) showPromises.push(this.renderCSS())
    if (this.shouldRenderHTML()) showPromises.push(this.renderHTML())
    Promise.all(showPromises).then(() => (this.hidden = false))
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
    return !this.grid
  }

  /**
   * renders the o-grid css
   *
   * @return {Promise<void>}
   */
  renderCSS () {
    this.css = /* css */`
      :host > section {
        display:grid;
          ${this.hasAttribute('height')
          ? `height: ${this.getAttribute('height') || '100%'};`
          : ''
        }
      }
    `
    if (this.hasAttribute('auto-fit')) this.css = /* css */`
      :host > section {
        grid-template-columns: repeat(auto-fit, minmax(${this.getAttribute('auto-fit') || '12.5em'}, 1fr));
        grid-template-rows: auto;
      }
    `
    if (this.hasAttribute('auto-fill')) this.css = /* css */`
      :host > section {
        grid-template-columns: repeat(auto-fill, minmax(${this.getAttribute('auto-fill') || '12.5em'}, 1fr));
        grid-template-rows: auto;
      }
    `
    if (this.getAttribute('gap')) this.css = /* css */`
      :host > section {
        gap: ${this.getAttribute('gap')};
      }
    `
    if (this.getAttribute('padding')) this.css = /* css */`
      :host > section > * {
        padding: ${this.getAttribute('padding')};
      }
    `
    // mobile
    this.css = /* css */`
      @media only screen and (max-width: _max-width_) {
        :host > section {
            ${this.hasAttribute('height-mobile')
            ? `height: ${this.getAttribute('height-mobile') || '100%'};`
            : ''
          }
        }
      }
    `
    if (this.hasAttribute('auto-fit-mobile')) this.css = /* css */`
      @media only screen and (max-width: _max-width_) {
        :host > section {
          grid-template-columns: repeat(auto-fit, minmax(${this.getAttribute('auto-fit-mobile') || '12.5em'}, 1fr));
          grid-template-rows: auto;
        }
      }
    `
    if (this.hasAttribute('auto-fill-mobile')) this.css = /* css */`
      @media only screen and (max-width: _max-width_) {
        :host > section {
          grid-template-columns: repeat(auto-fill, minmax(${this.getAttribute('auto-fill-mobile') || '12.5em'}, 1fr));
          grid-template-rows: auto;
        }
      }
    `
    if (this.getAttribute('gap-mobile')) this.css = /* css */`
      @media only screen and (max-width: _max-width_) {
        :host > section {
          gap: ${this.getAttribute('gap-mobile')};
        }
      }
    `
    if (this.getAttribute('padding-mobile')) this.css = /* css */`
      @media only screen and (max-width: _max-width_) {
        :host > section {
          padding: ${this.getAttribute('padding-mobile')};
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
    Array.from(this.section.children).forEach(node => {
      if ((node.getAttribute('style') || '').includes('background')) node.setAttribute('has-background', 'true')
      if (node.getAttribute('grid-column')) this.css = /* css */`
        :host > section > [grid-column="${node.getAttribute('grid-column')}"]{
          grid-column: ${node.getAttribute('grid-column')};
        }
      `
      if (node.getAttribute('grid-row')) this.css = /* css */`
        :host > section > [grid-row="${node.getAttribute('grid-row')}"]{
          grid-row: ${node.getAttribute('grid-row')};
        }
      `
      if (node.getAttribute('padding')) this.css = /* css */`
        :host > section > [padding="${node.getAttribute('padding')}"]{
          padding: ${node.getAttribute('padding')};
        }
      `
      // mobile
      if (node.getAttribute('grid-column-mobile')) this.css = /* css */`
        @media only screen and (max-width: _max-width_) {
          :host > section > [grid-column-mobile="${node.getAttribute('grid-column-mobile')}"]{
            grid-column: ${node.getAttribute('grid-column-mobile')};
          }
        }
      `
      if (node.getAttribute('grid-row-mobile')) this.css = /* css */`
        @media only screen and (max-width: _max-width_) {
          :host > section > [grid-row-mobile="${node.getAttribute('grid-row-mobile')}"]{
            grid-row: ${node.getAttribute('grid-row-mobile')};
          }
        }
      `
      if (node.getAttribute('padding-mobile')) this.css = /* css */`
        @media only screen and (max-width: _max-width_) {
          :host > section > [padding-mobile="${node.getAttribute('padding-mobile')}"]{
            padding: ${node.getAttribute('padding-mobile')};
          }
        }
      `
    })
    this.html = [this.section]
    return Promise.resolve()
  }
}
