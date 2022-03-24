/* global self */

// @ts-ignore
self.Environment = {
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
        return '1100px'
      default:
        return '767px'
    }
  }
}
