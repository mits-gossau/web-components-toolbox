// @ts-check
import { Shadow } from './Shadow.js'

/** @typedef {{
 selector: string, // finds first most specific/longest selector (selector.length) matching the node.tagName
 url: string, // url pointing to the javascript file or to a directory which contains javascript files (for directories the selector should end with a trailing hyphen)
 separateFolder?: boolean, // expects the component to be in a separate folder. Example: Button.js would be expected inside atoms/buttons/Button.js,
 separateFolderPlural?: boolean,
 fileEnding?: string
}} Directory */

/* global HTMLElement */
/* global self */
/* global fetch */
/* global CustomEvent */

/**
 * WcLoader is a loader script which finds all not defined nodes / web components, takes their node.tagNames and tries to resolve them by the directory given or url attribute directly set on the web components node
 * @export
 * @function WcLoader
 * @param {CustomElementConstructor} ChosenHTMLElement
 * @param {string} [baseUrl = './src/es/components/']
 * @param {Directory[]} [directories = [
  {
    selector: 'a-',
    url: 'atoms/',
    separateFolder: true
  },
  {
    selector: 'c-',
    url: 'controllers/',
    separateFolder: true
  },
  {
    selector: 'm-',
    url: 'molecules/',
    separateFolder: true
  },
  {
    selector: 'msrc-',
    url: 'msrc/',
    separateFolder: true
  },
  {
    selector: 'contentful-',
    url: 'contentful/',
    separateFolder: true
  },
  {
    selector: 'o-',
    url: 'organisms/',
    separateFolder: true
  },
  {
    selector: 'p-',
    url: 'pages/',
    separateFolder: true
  },
  {
    selector: 'third-party-',
    url: 'thirdParty/',
    separateFolder: true
  }
]]
 * @attribute {mode} [mode='open'] decide which ShadowRootMode it shall be + 'false' if no shadow is desired
 * @attribute {namespace} namespace all css vars by the string passed here
 * @attribute {namespace-fallback} if the node has this attribute it will make a fallback to the css vars without namespace
 * @property {
    baseUrl,
    directories
    load,
    resolve,
    loadListener
  }
 * @return {CustomElementConstructor | *}
 */
export const WcLoader = (ChosenHTMLElement = HTMLElement, baseUrl = './src/es/components/', directories = [
  {
    selector: 'a-',
    url: 'atoms/',
    separateFolder: true
  },
  {
    selector: 'c-',
    url: 'controllers/',
    separateFolder: true
  },
  {
    selector: 'm-',
    url: 'molecules/',
    separateFolder: true
  },
  {
    selector: 'msrc-',
    url: 'msrc/',
    separateFolder: true
  },
  {
    selector: 'contentful-',
    url: 'contentful/',
    separateFolder: true
  },
  {
    selector: 'o-',
    url: 'organisms/',
    separateFolder: true
  },
  {
    selector: 'p-',
    url: 'pages/',
    separateFolder: true
  },
  {
    selector: 'third-party-',
    url: 'thirdParty/',
    separateFolder: true
  }
]) => class WcLoader extends Shadow(ChosenHTMLElement) {
  constructor (...args) {
    // @ts-ignore
    super(...args)

    if (this.hasAttribute('baseUrl')) {
      this.baseUrl = this.getAttribute('baseUrl')
    } else {
      this.setAttribute('baseUrl', this.baseUrl = baseUrl)
    }
    if (this.hasAttribute('directories')) {
      WcLoader.parseAttribute(this.getAttribute('directories')).forEach(directory => {
        // overwrite define and set it as attribute
      })
    } else {
      this.setAttribute('directories', JSON.stringify(this.directories = directories))
    }
  }

  /**
   * Lifecycle callback, triggered when node is attached to the dom
   * must be here as a placeholder
   *
   * @return {void}
   */
  connectedCallback () {}

  /**
   * Lifecycle callback, triggered when node is detached from the dom
   * must be here as a placeholder
   *
   * @return {void}
   */
  disconnectedCallback () {}

 
}
