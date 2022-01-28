// @ts-check
import Body from './Body.js'
import { Wrapper as BaseWrapper } from '../web-components-cms-template/src/es/components/organisms/Wrapper.js'

/**
 * As an organism, this component shall hold molecules and/or atoms
 * NOTE: This component requires a new version of wc-config to consume it directly as o-wrapper. At customElements.define you have to use Wrapper()... Check out => https://github.com/mits-gossau/web-components-cms-template-logistik/blob/master/wc-config.js
 * Example at: https://mits-gossau.github.io/web-components-cms-template-logistik/src/es/components/pages/Home.html TeaserWrapper extends this
 *
 * @export
 * @class Wrapper
 * @type {CustomElementConstructor}
 * @attribute {
 *  {number%} [any-{columnNumber}-width] define which column has what exact width in percent
 *  {has} [flex-nowrap-mobile] force the content to not wrap on mobile view
 * }
 * @return {CustomElementConstructor | *}
 */
export default class Wrapper extends BaseWrapper(Body) {}
