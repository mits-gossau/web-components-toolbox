// @ts-check
import { Hover } from '../../prototypes/Hover.js'

/**
 * IconAmp is an icon
 * Example at: /src/es/components/molecules/navigation/nature-/nature-.html
 * As an atom, this component can not hold further children (those would be quantum)
 *
 * @export
 * @class IconAmp
 * @type {CustomElementConstructor}
 */
export default class IconAmp extends Hover() {
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
    return !this.root.querySelector(`:host > style[_css], ${this.tagName} > style[_css]`)
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
        vertical-align: middle;
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
    <svg width="14" height="19" viewBox="0 0 14 19" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M13.7108 8.532C13.8259 9.24574 13.9209 9.80898 13.951 9.96861C14.0435 10.4932 14.0047 11.0318 13.838 11.5386C13.6656 12.0259 13.2695 12.7317 11.8374 13.255L11.0412 13.5487L10.8155 12.7606C10.6207 12.0909 10.438 11.0985 11.0844 10.2204C11.4195 9.79003 11.8521 9.44138 12.3483 9.20173C12.5041 9.12945 13.0357 8.86698 13.7106 8.532M6.52101 10.0979L7.02787 9.56453C9.5743 6.89655 7.77276 4.36744 7.38701 3.88652C7.17979 3.62793 5.00884 0.72256 4.98831 0.69246L4.84479 0.5L4.70127 0.69246C4.67794 0.72256 2.50979 3.62793 2.30256 3.88652C1.91892 4.36379 0.139781 6.85801 2.60593 9.50661L2.42531 9.65301C0.828896 10.9884 0.0123681 12.4058 0 13.8655C0.0137404 14.5042 0.16076 15.1334 0.432052 15.7147C0.703345 16.2959 1.0932 16.8169 1.57774 17.2458C2.52883 18.047 3.74054 18.4916 4.99624 18.5C6.42837 18.5 7.83599 17.9126 9.18202 16.7517L10.3332 18.0209L12.2764 16.4247L6.52101 10.0979ZM4.10177 11.4914L4.27609 11.3512L7.50976 14.9085C6.63163 15.6804 5.78616 16.0694 4.99204 16.0694C4.3726 16.0579 3.77561 15.8408 3.29924 15.4537C3.29108 15.4478 2.54619 14.7801 2.55436 13.8899C2.56719 12.9739 3.40426 12.0797 4.102 11.4923L4.10177 11.4914ZM4.84455 8.28117L4.55776 7.97743C4.22545 7.62853 3.79653 7.08513 3.90108 6.38553C3.96565 6.0322 4.1139 5.69852 4.33396 5.41114C4.39347 5.33703 4.56172 5.1163 4.84479 4.74141C5.12482 5.11037 5.29424 5.3368 5.35561 5.41114C5.57799 5.69643 5.7265 6.03001 5.78849 6.38348C5.83983 6.71823 5.82537 7.25 5.12785 7.97971L4.84455 8.28117Z" fill="#7FC56E" />
    </svg>
    `
  }

  get svg () {
    return this.root.querySelector('svg')
  }
}
