/* global self */
/* global location */

// @ts-ignore
self.Environment = {
  isLocalhost: location.hostname === 'localhost',
  contentfulEndpoint: 'https://graphql.contentful.com/content/v1/spaces/',
  contentfulRenderer: '//cdn.jsdelivr.net/npm/@contentful/rich-text-html-renderer@15.13.1/dist/rich-text-html-renderer.es5.min.js',
  /**
   *
   *
   * @param {{constructor?: string, tagName?: string}} organism
   * @return {string}
   */
  mobileBreakpoint: ({ constructor, tagName }) => {
    switch (true) {
      case constructor && typeof constructor.includes === 'function' && constructor.includes('Header'):
      case constructor && typeof constructor.includes === 'function' && constructor.includes('Navigation'):
      case tagName && typeof tagName.includes === 'function' && tagName.includes('O-NAV-WRAPPER'):
      case constructor && typeof constructor.includes === 'function' && constructor.includes('Footer'):
      case constructor && typeof constructor.includes === 'function' && constructor.includes('Login'):
        return '1200px'
      default:
        return '767px'
    }
  },
  getApiBaseUrl: function (type) {
    switch (type) {
      case 'zadb':
        return this.isLocalhost ? 'https://testadmin.betriebsrestaurants-migros.ch/umbraco/api/ZadbApi' : 'https://admin.betriebsrestaurants-migros.ch/umbraco/api/ZadbApi'
      default:
        return ''
    }
  }
}
