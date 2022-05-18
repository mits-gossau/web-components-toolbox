/* global self */
/* global location */

// @ts-ignore
self.Environment = {
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
        console.log(this)
        return this.isLocalhost ? 'https://www.betriebsrestaurants-migros.ch' : ''
      default:
        return ''
    }
  }
}
