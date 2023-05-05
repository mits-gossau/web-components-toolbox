// @ts-check
import { Hover } from '../../prototypes/Hover.js'

/**
 * Arrow is an icon
 * Example at: /src/es/components/pages/Home.html
 * As an atom, this component can not hold further children (those would be quantum)
 *
 * @export
 * @class Arrow
 * @type {CustomElementConstructor}
 * @attribute {
 *  {up, right, down, left} [direction=left]
 * }
 * @css {
 *  --color [#777]
 *  --font-size [1.2em]
 *  --color-hover [white]
 * }
 */
export default class Arrow extends Hover() {
  static get observedAttributes () {
    return ['hover']
  }

  connectedCallback () {
    super.connectedCallback()
    if (this.shouldRenderCSS()) this.renderCSS()
    if (this.shouldRenderHTML()) this.renderHTML()
  }

  attributeChangedCallback (name, oldValue, newValue) {
    if (name === 'hover') {
      const duration = 300
      // NOTE: Don't copy below part, usually setting css must go through function setCss but the below is an exception, since it does not contain css variables!
      this.style.textContent = /* CSS */ `
        :host > svg{
          animation: move ${duration}ms ease-out ${newValue ? '' : 'reverse'};
        }
      `
      clearTimeout(this.timeout)
      this.timeout = setTimeout(
        () => (this.style.textContent = ''),
        duration + 100
      )
    }
  }

  /**
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldRenderCSS () {
    return !this.root.querySelector(
      `:host > style[_css], ${this.tagName} > style[_css]`
    )
  }

  /**
   * evaluates if a render is necessary
   *
   * @return {boolean}
   */
  shouldRenderHTML () {
    return !this.svg
  }

  /**
   * Renders the CSS.
   *
   * @return {void}
   */
  renderCSS () {
    const upKeyframes = /* css */ `
      @keyframes move {
        0% { transform: rotate(270deg) translateY(0); }
        48% { transform: rotate(270deg) translateY(-0.8em); opacity: 1; }
        49% { transform: rotate(270deg) translateY(-0.8em); opacity: 0; }
        50% { transform: rotate(270deg) translateY(0.8em); opacity: 0; }
        51% { transform: rotate(270deg) translateY(0.8em); opacity: 1; }
        100% { transform: rotate(270deg) translateY(0); }
      }
    `
    const downKeyframes = /* css */ `
      @keyframes move {
        0% { transform: rotate(90deg) translateY(0); }
        48% { transform: rotate(90deg) translateY(-0.8em); opacity: 1; }
        49% { transform: rotate(90deg) translateY(-0.8em); opacity: 0; }
        50% { transform: rotate(90deg) translateY(0.8em); opacity: 0; }
        51% { transform: rotate(90deg) translateY(0.8em); opacity: 1; }
        100% { transform: rotate(90deg) translateY(0); }
      }
    `
    const leftKeyframes = /* css */ `
      @keyframes move {
        0% { transform: rotate(180deg) translateY(0); }
        48% { transform: rotate(180deg) translateY(-0.8em); opacity: 1; }
        49% { transform: rotate(180deg) translateY(-0.8em); opacity: 0; }
        50% { transform: rotate(180deg) translateY(0.8em); opacity: 0; }
        51% { transform: rotate(180deg) translateY(0.8em); opacity: 1; }
        100% { transform: rotate(180deg) translateY(0); }
      }
    `
    const rightKeyframes = /* css */ `
      @keyframes move {
        0% { transform: translateY(0); }
        48% { transform: translateY(-0.8em); opacity: 1; }
        49% { transform: translateY(-0.8em); opacity: 0; }
        50% { transform: translateY(0.8em); opacity: 0; }
        51% { transform: translateY(0.8em); opacity: 1; }
        100% { transform: translateY(0); }
      }
    `

    let directionKeyframes = rightKeyframes
    switch (this.getAttribute('direction')) {
      case 'up':
        directionKeyframes = upKeyframes
        break
      case 'down':
        directionKeyframes = downKeyframes
        break
      case 'left':
        directionKeyframes = leftKeyframes
        break
      default:
        directionKeyframes = rightKeyframes
        break
    }
    this.css = directionKeyframes;

    this.css = /* css */ `
      :host {
        cursor: pointer;
        display: inline-block;
        overflow: hidden;
        margin-bottom: 0.225em;
        height: var(--svg-size, 1.5em);
        width: var(--svg-size, 1.5em);
        vertical-align: middle;
      }
      :host > svg {
        align-items: center;
        color: var(--color, #777);
        height: var(--svg-size, 1.5em);
        justify-content: center;
        width: var(--svg-size, 1.5em);
      }
      :host > svg path {
        stroke: var(--path-color, var(--color, #777));
        transition: var(--path-transition, all 0.3s ease-out);
      }
      :host(:hover) > svg path, :host(.hover) > svg path{
        stroke: var(--path-color-hover, var(--color, #777));
      }
      :host([direction=up]) > svg {
        transform: rotate(270deg);
      }
      :host([direction=right]) > svg {
        transform: rotate(0deg);
      }
      :host([direction=down]) > svg {
        transform: rotate(90deg);
      }
      :host([direction=left]) > svg {
        transform: rotate(180deg);
      }`
  }

  /**
   * renders the html
   *
   * @return {void}
   */
  renderHTML () {
    // TODO: SVG's should be taken from icons folder but fetch can't use cache and is too slow on loads of requests at once. object, img, etc. does not work for css styling. so most likely it needs a node script copying this stuff on update in the icon folder.
    // TODO: or solve the problem with an icon controller with caching. Send event with Promise.resolve to controller, which then resolves it with the svg
    // src/es/components/web-components-toolbox/src/icons/chevron_right.svg
    this.html = /* html */ `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `
    this.html = this.style
  }

  get svg () {
    return this.root.querySelector('svg')
  }

  get style () {
    return (
      this._style ||
      (this._style = (() => {
        const style = document.createElement('style')
        style.setAttribute('protected', 'true')
        return style
      })())
    )
  }
}
