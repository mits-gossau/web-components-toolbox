// @ts-check

/* global customElements */
/* global self */
/* global CustomEvent */

// wc-config is a loader script which finds all not defined nodes / web components, takes their node.tagNames and tries to resolve them by the directory given or url attribute directly set on the web components node
// the javascript files to be resolved must have a default export to be applied as customElements.define constructor

// script inclusion example: <script type="text/javascript" src="../../../../wc-config.js"></script>
// script inclusion example with parameters: <script type="text/javascript" src="/wc-config.js?baseUrl=/src/es/components/&directories=[{'selector': 'a-picture', 'url': 'atoms/Picture.js'}]"></script>
// about script src url parameters:
//  1) {string}[baseUrl='./src/es/components/'] only used to prepend url if the url is relative / does not start with a '/' nor '.')
//  2) {directory[]}[directories=[]] which will overwrite/complement the default directories example: directories=[{'selector': 'a-picture', 'url': 'atoms/Picture.js'}, {'selector': 'a-', 'url': 'all/'}]
//  3) {boolean}[useDefaultDirectories=true] If the default defined directories shall be used/complemented upon
//  4) {string}[querySelector=''] to be prepended to querySelectorAll(`${src.searchParams.get('selector') || ''}:not(:defined)`) which finds all not defined nodes / web components with your querySelector
//  5) {string}[urlAttributeName='url'] to define the attribute/node property name at which it will be searching the attribute with a url which can be directly set on the web components node example <a-picture url="./that/folder/Picture.js"></a-picture>
//  6) {boolean}[urlAttributeLastTrumpsAll=true] set to false if it is desired that the first node with the url attribute has the final say about the files location
//  7) {string, false}[wc-config-load='wc-config-load'] the name under which the application will Promise.all.finally execute the console.info and emit the CustomEvent(Name) at document.body, set to false if Event and Log shall be suppressed
//  8) {boolean}[debug=true] assumes we are on debug and does post the result on console.info. Set to 'false' to suppress the console.info
//  9) {boolean}[resolveImmediately=false] if true, customElements.define all elements immediately after import promise resolved. This can lead to the blitz/flashing when web components already connect while others are not. shadow doms then possibly prevent css rules like ":not(:defined) {display: none;}" to be effective
(function (self, document, baseUrl, directories) {
  /**
   * Directory sets selector and url by which a reference between tagName/selector and url/file can be done (customElements.define(name aka. tagName, constructor))
   * The following two options are available:
   *  1) a specific selector can be fed with a specific url to a javascript file example: {selector: 'playlist-item', url: './src/es/components/molecules/PlaylistItem.js'}
   *  2) a non-specific selector can be fed with a url to a folder example: {selector: 'm-', url: './src/es/components/molecules/'} which will resolve example: tagName m-playlist-item to fileName PlaylistItem.js at location ./src/es/components/molecules/PlaylistItem.js
   *
   * @typedef {{
      selector: string, // finds first most specific/longest selector (selector.length) matching the node.tagName
      url: string, // url pointing to the javascript file or to a directory which contains javascript files (for directories the selector should end with a trailing hyphen)
      separateFolder?: boolean, // expects the component to be in a separate folder. Example: Button.js would be expected inside atoms/buttons/Button.js
      fileEnding?: string
    }} Directory
   */
  /**
   * @typedef {Promise<[string, CustomElementConstructor] | string>} ImportEl
   */
  /** @type {URL} */
  // @ts-ignore
  const src = new URL(document.currentScript.src)
  /**
   * the attribute/property name at which will be searched for an url on the web component node
   * @type {string}
   */
  const urlAttributeName = src.searchParams.get('urlAttributeName') || 'url'
  /**
   * the event and console.info name used to signal when imports are done
   * @type {string}
   */
  const wcConfigLoad = src.searchParams.get('wc-config-load') || 'wc-config-load'
  /**
   * the baseUrl should point to the components folder and is only used if the url is relative / url.charAt(0) is not "." nor "/"
   * @type {string}
   */
  baseUrl = src.searchParams.get('baseUrl') || baseUrl
  /** @type {Directory[]} */
  directories = JSON.parse((src.searchParams.get('directories') || '').replace(/'/g, '"') || '[]').concat(src.searchParams.get('useDefaultDirectories') !== 'false' ? directories : []).sort((a, b) => b.selector.length - a.selector.length) // list must be sorted by longest and most specific selector first (selector string length descending)
  /**
   * loading and defining the web components by its tagNames
   *
   * @param {ImportEl[]} imports
   * @returns {void}
   */
  const resolve = imports => {
    imports.forEach((importEl, i) => {
      importEl.then(element => {
        if (Array.isArray(element)) {
          // @ts-ignore
          if (typeof element[1] === 'object') element[1] = element[1][Object.keys(element[1])[0]]() // helps to load functions which return the component class eg: src/es/components/web-components-cms-template/src/es/components/organisms/Wrapper.js
          if (customElements.get(element[0])) return imports.splice(i, 1, Promise.resolve(`${element[0]} is already defined @resolve`))
          customElements.define(...element)
        }
      })
    })
  }
  /**
   * loading the web components by its tagNames
   *
   * @param {string} tagName
   * @param {string} url
   * @returns {ImportEl}
   */
  const load = (tagName, url) => {
    // baseUrl is only used if url is relative / does not start with "." nor "/"
    if (!customElements.get(tagName)) {
      /** @type {Directory} */
      const directory = directories.find(directory => tagName.includes(directory.selector)) || { url: '', selector: '' }
      /**
       * urls priority is node.attribute, searchParams.directory, preset adjustable directory
       * @type {string}
       */
      url = url || directory.url
      if (url) {
        /**
         * js or mjs
         * @type {string} ['js']
         */
        const fileEnding = directory.fileEnding || 'js'
        /**
         * if the url points to a javascript file the fileName will be an empty string '' else it will replace the directory.selector from tagName, if possible, then it will convert hyphen separated tagNames to camel case example: playlist-item => PlaylistItem
         * @type {string}
         */
        const fileName = /.[m]{0,1}js/.test(url) ? '' : `${(tagName.replace(directory.selector, '') || tagName).charAt(0).toUpperCase()}${(tagName.replace(directory.selector, '') || tagName).slice(1).replace(/-([a-z]{1})/g, (match, p1) => p1.toUpperCase())}.${fileEnding}`
        if (directory.separateFolder) url += `${fileName.replace(`.${fileEnding}`, '').toLowerCase()}s/`
        /** @type {ImportEl} */
        const importEl = import(`${/[./]{1}/.test(url.charAt(0)) ? '' : baseUrl}${url}${fileName}`).then(module => /** @returns {[string, CustomElementConstructor]} */ [tagName, module.default || module])
        if (src.searchParams.get('resolveImmediately') === 'true') resolve([importEl])
        return importEl
      }
      return Promise.resolve(`${tagName} url has not been found within the directories nor is an attribute ${urlAttributeName}, used as path to the web component, present on node`)
    }
    return Promise.resolve(`${tagName} is already defined @load`)
  }
  self.addEventListener('load', event => {
    /** @type {ImportEl[]} */
    const imports = []
    // finding all not defined web component nodes in the dom and forwarding their tagNames to the load function
    Array.from(document.querySelectorAll(`${src.searchParams.get('querySelector') || ''}:not(:defined)`)).reduce((nodes, currentNode) => {
      const index = nodes.findIndex(node => node.tagName === currentNode.tagName)
      if (index !== -1) {
        if ((src.searchParams.get('urlAttributeLastTrumpsAll') !== 'false' || !nodes[index].hasAttribute(urlAttributeName)) && currentNode.hasAttribute(urlAttributeName)) nodes.splice(index, 1, currentNode)
        return nodes
      }
      return [...nodes, currentNode]
    }, []).forEach(node => imports.push(load(node.tagName.toLowerCase(), node.getAttribute(urlAttributeName) || '')))
    // after all the imports have started we can resolve and do customElements.define
    Promise.all(imports).then(elements => {
      if (src.searchParams.get('resolveImmediately') !== 'true') resolve(imports)
    }).catch(error => {
      console.error(wcConfigLoad, error)
      if (src.searchParams.get('resolveImmediately') !== 'true') resolve(imports)
    }).finally(() => {
      // finally is not properly supported but we resolve on success as well as on error. Important is to wait for all, to avoid UI blitz/flashes
      if (src.searchParams.get('wc-config-load') !== 'false') {
        if (src.searchParams.get('debug') !== 'false') console.info(wcConfigLoad, imports)
        document.body.dispatchEvent(new CustomEvent(wcConfigLoad,
          {
            detail: { imports },
            bubbles: true,
            cancelable: true,
            composed: true
          }
        ))
      }
    })
  }, { once: true })
})(window || self, document,
  // ↓↓↓ adjustable ↓↓↓
  './src/es/components/', // baseUrl
  [
    {
      selector: 'a-',
      url: 'atoms/'
    },
    {
      selector: 'c-',
      url: 'controllers/'
    },
    {
      selector: 'm-',
      url: 'molecules/'
    },
    {
      selector: 'msrc-',
      url: 'msrc/'
    },
    {
      selector: 'o-',
      url: 'organisms/'
    },
    {
      selector: 'p-',
      url: 'pages/'
    },
    {
      selector: 'third-party-',
      url: 'thirdParty/'
    }
  ] // directories
  // ↑↑↑ adjustable ↑↑↑
)
