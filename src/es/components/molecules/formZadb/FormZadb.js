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

    this.keydownListener = event => {
      console.log(event.target, this.root.querySelector(':focus').value)
      // if (event.keyCode === 13) return this.clickListener(event)
    }
  }

  connectedCallback () {
    super.connectedCallback()
    document.addEventListener('keydown', this.keydownListener)
    this.initForm()
  }

  disconnectedCallback () {
    super.disconnectedCallback()
    document.removeEventListener('keydown', this.keydownListener)
  }

  async initForm () {
    let city
    if ((city = this.root.querySelector('#city'))) city.setAttribute('disabled', true)
    try {
      const response = await fetch('https://www.betriebsrestaurants-migros.ch/umbraco/api/BetriebsrestaurantZadbApi/GetAllCities')
      const cities = await response.json()
      console.log(cities)
    } catch (error) {
      console.log('There was a problem: ', error)
    }
  }
}
