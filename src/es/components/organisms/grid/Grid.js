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
  connectedCallback () {
    this.hidden = true
    const showPromises = []
    if (this.shouldComponentRenderCSS()) showPromises.push(this.renderCSS())
    if (this.shouldComponentRenderHTML()) showPromises.push(this.renderHTML())
    Promise.all(showPromises).then(() => (this.hidden = false))
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
      case 'grid-2colums2rows-':
        return this.fetchCSS([{
          path: `${import.meta.url.replace(/(.*\/)(.*)$/, '$1')}./2colums2rows-/2colums2rows-.css`, // apply namespace since it is specific and no fallback
          namespace: false
        }, ...styles], false).then(fetchCSSParams => {
          // make template ${code} accessible
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
    })
    this.html = [this.section]
    return Promise.resolve()
  }
}
