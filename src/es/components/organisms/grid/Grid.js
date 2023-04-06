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
   * Renders the o-grid CSS.
   *
   * @return {Promise<void>}
   */
  async renderCSS() {
    this.css = /* css */ `
      :host > section {
        display: grid;
        ${this.hasAttribute('height') ? `height: ${this.getAttribute('height') || '100%'};` : ''}
      }
    `;
    /** @type {import("../../prototypes/Shadow.js").fetchCSSParams[]} */
    const styles = [
      {
        path: `${import.meta.url.replace(/(.*\/)(.*)$/, '$1')}../../../../css/reset.css`, // no variables for this reason no namespace
        namespace: false,
      },
      {
        path: `${import.meta.url.replace(/(.*\/)(.*)$/, '$1')}../../../../css/style.css`, // apply namespace and fallback to allow overwriting on deeper level
        namespaceFallback: true,
      },
    ];
    switch (this.getAttribute('namespace')) {
      case 'grid-2colums2rows-':
        const fetchCSSParams = await this.fetchCSS(
          [
            {
              path: `${import.meta.url.replace(/(.*\/)(.*)$/, '$1')}./2colums2rows-/2colums2rows-.css`, // apply namespace since it is specific and no fallback
              namespace: false,
            },
            ...styles,
          ],
          false
        );
        // make template ${code} accessible
        fetchCSSParams[0].styleNode.textContent = eval('`' + fetchCSSParams[0].style + '`')// eslint-disable-line no-eval
        break;
      default:
        await this.fetchCSS(styles, false);
        break;
    }
  }

  /**
   * Renders the HTML.
   *
   * @return {Promise<void>}
   */
  async renderHTML() {
    const section = this.root.querySelector(`${this.cssSelector} > section`) || document.createElement('section');
    for (const node of Array.from(this.root.children)) {
      if (node.tagName !== 'STYLE' && node.tagName !== 'SECTION') section.appendChild(node);
    }
    this.setAttribute('count-section-children', section.children.length);
    for (const node of section.children) {
      if ((node.getAttribute('style') || '').includes('background')) node.setAttribute('has-background', 'true');
    }
    this.html = [section];
  }
}
