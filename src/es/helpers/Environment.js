/* global self */

// @ts-ignore
self.Environment = {
  contentfulRenderer: '//cdn.jsdelivr.net/npm/@contentful/rich-text-html-renderer@15.13.1/dist/rich-text-html-renderer.es5.min.js',
  isLocalhost: location.hostname === 'localhost',
  /**
   *
   *
   * @param {{constructor: string, tagName: string}} organism
   * @return {string}
   */
  mobileBreakpoint: ({ constructor, tagName }) => {
    switch (true) {
      case constructor.includes('Header'):
      case constructor.includes('Navigation'):
      case tagName.includes('O-NAV-WRAPPER'):
      case constructor.includes('Footer'):
        return '1200px'
      default:
        return '767px'
    }
  },
  getApiBaseUrl: function (type) {
    switch (type) {
      case 'zadb':
        return this.isLocalhost ? 'https://www.betriebsrestaurants-migros.ch' : ''
      default:
        return ''
    }
  }
}
