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
  async connectedCallback() {
    this.hidden = true;
    const showPromises = [];
    if (this.shouldRenderCSS()) {
      showPromises.push(this.renderCSS());
    }
    if (this.shouldRenderHTML()) {
      showPromises.push(this.renderHTML());
    }
    await Promise.all(showPromises);
    this.hidden = false;
  }

  /**
   * Evaluates whether a render is necessary.
   *
   * @return {boolean}
   */
  shouldRenderCSS() {
    return !this.root.querySelector(`:host > style[_css], ${this.tagName} > style[_css]`);
  }

  /**
   * Evaluates whether a render is necessary.
   *
   * @return {boolean}
   */
  shouldRenderHTML() {
    return !this.grid;
  }

  /**
   * Renders the o-grid CSS.
   *
   * @return {Promise<void>}
   */
  async renderCSS() {
    const url = import.meta.url.replace(/(.*\/)(.*)$/, '$1');
    this.css = /* css */ `
      :host > section {
        display: grid;
        ${this.hasAttribute('height') ? `height: ${this.getAttribute('height') || '100%'};` : ''}
      }
    `;
    const styles = [
      {
        path: `${url}../../../../css/reset.css`,
        namespace: false,
      },
      {
        path: `${url}../../../../css/style.css`,
        namespaceFallback: true,
      },
    ];
    switch (this.getAttribute('namespace')) {
      case 'grid-2colums2rows-':
        const [{ styleNode, style }] = await this.fetchCSS(
          [
            {
              path: `${url}./2colums2rows-/2colums2rows-.css`,
              namespace: false,
            },
            ...styles,
          ],
          false
        );
        styleNode.textContent = `${style}`;
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
