/* global self */
/* global location */

const currentScriptUrl = new URL(document.currentScript.src)

// @ts-ignore
self.Environment = {
  isTestingEnv: location.hostname === 'localhost' || location.hostname.includes('.local') || location.hostname.includes('umb.') || location.hostname.includes('test.') || location.hostname.includes('testadmin.'),
  language: currentScriptUrl.searchParams.get('language') || document.documentElement.getAttribute('lang') || 'de',
  contentfulEndpoint: currentScriptUrl.searchParams.get('contentfulEndpoint') || 'https://graphql.contentful.com/content/v1/spaces/',
  msrcBaseUrl: currentScriptUrl.searchParams.get('msrcBaseUrl') || 'https://cdn.migros.ch',
  msrcVersion: currentScriptUrl.searchParams.get('msrcVersion') || '20221205123932',
  mcsBaseUrl: currentScriptUrl.searchParams.get('mcsBaseUrl') || 'https://digital-campaign-factory.migros.ch',
  mcsVersion: currentScriptUrl.searchParams.get('mcsVersion'), /* || 'v1.112.3', // the newest version gets fetched if this parameter is not set */
  /**
   * Get custom mobile breakpoint
   * @param {{constructor?: string, tagName?: string, namespace?: string}} organism
   * @return {string}
   */
  mobileBreakpoint: ({ constructor, tagName, namespace } = {}) => {
    switch (true) {
      case constructor && typeof constructor.includes === 'function' && constructor.includes('Header'):
      case constructor && typeof constructor.includes === 'function' && constructor.includes('Logo'):
      case constructor && typeof constructor.includes === 'function' && constructor.includes('Navigation'):
      case tagName && typeof tagName.includes === 'function' && tagName.includes('O-NAV-WRAPPER'):
      case constructor && typeof constructor.includes === 'function' && constructor.includes('Footer'):
      case constructor && typeof constructor.includes === 'function' && constructor.includes('Login'):
      case constructor && typeof constructor.includes === 'function' && constructor.includes('CarouselTwo') && namespace === 'carousel-two-teaser-':
        return '1200px'
      default:
        return '767px'
    }
  },
  getApiBaseUrl: function (type) {
    switch (type) {
      case 'zadb':
        return currentScriptUrl.searchParams.get('zadbEndpoint') || this.isTestingEnv ? 'https://testadmin.betriebsrestaurants-migros.ch/umbraco/api/ZadbApi' : 'https://admin.betriebsrestaurants-migros.ch/umbraco/api/ZadbApi'
      case 'migrospro': {
        return {
          apiRemoveFromOrder: this.isTestingEnv ? 'https://testadmin.migrospro.ch/umbraco/api/MigrosProOrderApi/RemoveFromOrder' : 'https://admin.migrospro.ch/umbraco/api/MigrosProOrderApi/RemoveFromOrder',
          apiAddToOrder: this.isTestingEnv ? 'https://testadmin.migrospro.ch/umbraco/api/MigrosProOrderApi/AddToOrder' : 'https://admin.migrospro.ch/umbraco/api/MigrosProOrderApi/AddToOrder',
          apiDeleteFromOrder: this.isTestingEnv ? 'https://testadmin.migrospro.ch/umbraco/api/MigrosProOrderApi/DeleteFromOrder' : 'https://admin.migrospro.ch/umbraco/api/MigrosProOrderApi/DeleteFromOrder',
          apiGetActiveOrderAndOrderItems: this.isTestingEnv ? 'https://testadmin.migrospro.ch/umbraco/api/MigrosProOrderApi/GetActiveOrderAndOrderItems' : 'https://admin.migrospro.ch/umbraco/api/MigrosProOrderApi/GetActiveOrderAndOrderItems',
          apiGetProductByCategory: this.isTestingEnv ? 'https://testadmin.migrospro.ch/umbraco/api/MigrosProProductApi/GetProductsByCategory' : 'https://admin.migrospro.ch/umbraco/api/MigrosProProductApi/GetProductsByCategory',
          apiGetActiveOrderAndOrderItemsEnrichedProductData: this.isTestingEnv ? 'https://testadmin.migrospro.ch/umbraco/api/MigrosProOrderApi/GetActiveOrderAndOrderItemsEnrichedProductData' : 'https://admin.migrospro.ch/umbraco/api/MigrosProOrderApi/GetActiveOrderAndOrderItemsEnrichedProductData'
        }
      }
      default:
        return ''
    }
  }
}
