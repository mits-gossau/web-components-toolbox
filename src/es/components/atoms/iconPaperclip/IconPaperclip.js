// @ts-check
import { Hover } from '../../prototypes/Hover.js'

/**
 * IconPaperclip is an icon
 * Example at: /src/es/components/pages/Home.html
 * As an atom, this component can not hold further children (those would be quantum)
 *
 * @export
 * @class IconPaperclip
 * @type {CustomElementConstructor}
 */
export default class IconPaperclip extends Hover() {
  
  constructor(options = {}, ...args) {
    super({ tabindex: 'no-tabindex', ...options }, ...args)
  }

  connectedCallback () {
    super.connectedCallback()
    if (this.shouldRenderCSS()) this.renderCSS()
    if (this.shouldRenderHTML()) this.renderHTML()
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
    return !this.svg
  }

  /**
   * renders the css
   *
   * @return {void}
   */
  renderCSS () {
    this.css = /* css */`
      :host {
        display: inline-block;
        overflow: hidden;
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
        stroke: var(--path-color-hover, var(--color-hover, var(--color, #777)));
      }
      :host(:hover), :host(.hover){
        cursor: pointer;
      }
    `
    // font-family can have an effect on size on the bounding h-tag with .bg-color
    if (this.parentElement && this.parentElement.children.length === 1) this.parentElement.setAttribute('style', 'font-family: inherit')
  }

  /**
   * renders the html
   *
   * @return {void}
   */
  renderHTML () {
    // TODO: SVG's should be taken from icons folder but fetch can't use cache and is too slow on loads of requests at once. object, img, etc. does not work for css styling. so most likely it needs a node script copying this stuff on update in the icon folder.
    // TODO: or solve the problem with an icon controller with caching. Send event with Promise.resolve to controller, which then resolves it with the svg
    // src/es/components/web-components-toolbox/src/icons/paperclip.svg
    this.html = /* html */`
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M21.44 11.05L12.25 20.24C11.1242 21.3659 9.5972 21.9984 8.00502 21.9984C6.41283 21.9984 4.88586 21.3659 3.76002 20.24C2.63417 19.1142 2.00168 17.5872 2.00168 15.995C2.00168 14.4029 2.63417 12.8759 3.76002 11.75L12.95 2.56004C13.7006 1.80948 14.7186 1.38782 15.78 1.38782C16.8415 1.38782 17.8595 1.80948 18.61 2.56004C19.3606 3.3106 19.7822 4.32859 19.7822 5.39004C19.7822 6.4515 19.3606 7.46948 18.61 8.22004L9.41002 17.41C9.03473 17.7853 8.52574 17.9962 7.99502 17.9962C7.46429 17.9962 6.9553 17.7853 6.58002 17.41C6.20473 17.0348 5.9939 16.5258 5.9939 15.995C5.9939 15.4643 6.20473 14.9553 6.58002 14.58L15.07 6.10004" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `
  }

  get svg () {
    return this.root.querySelector('svg')
  }
}
