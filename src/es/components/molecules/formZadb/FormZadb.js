// @ts-check
import Form from '../form/Form.js'

/* global customElements */
/* global self */
/* global fetch */

/**
 * As a molecule, this component shall hold Atoms
 * Umbraco Forms Styling
 * Example at: http://localhost:4200/src/es/components/pages/Formularbestellung.html
 *
 * @export
 * @class Wrapper
 * @type {CustomElementConstructor}
 * @attribute {
 *
 * }
 * @return {CustomElementConstructor | *}
 */
export default class FormZadb extends Form {
  constructor (...args) {
    super(...args)
  }

  connectedCallback () {
    super.connectedCallback()
    this.initForm()
  }

  disconnectedCallback () {
    // TODO
  }

  async initForm () {
    try {
      const response = await fetch('https://www.betriebsrestaurants-migros.ch/umbraco/api/BetriebsrestaurantZadbApi/GetAllCities')
      const cities = await response.json()
      console.log(cities)
    } catch (error) {
      console.log('There was a problem: ', error)
    }
  }
}
