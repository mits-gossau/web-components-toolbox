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

  constructor(...args) {
    super(...args)

    this.keydownListener = async event => {
      const inputVal = this.root.querySelector(':focus').value;
      console.log("input value", inputVal);
      //if (!inputVal) return;
      let results = [];
      if (inputVal.length > 2) {
        results = await this.search(inputVal);
      }
      console.log("found:", results)
      this.showSuggestions(results, inputVal);
    }

    this.updateValueListener = event => {
      console.log("update value event", event.detail.data)
      this.city.removeAttribute('disabled')
      this.city.value = event.detail.data.name
      // 
      this.suggestionField.innerHTML = ''
    }
  }

  connectedCallback() {
    super.connectedCallback()
    this.initForm()
    document.addEventListener('keydown', this.keydownListener)
    this.suggestionField.addEventListener('click', this.useSuggestion);
    this.addEventListener('updateFormValue', this.updateValueListener)
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    document.removeEventListener('keydown', this.keydownListener)
  }

  async search(str) {
    const allCities = await this.getCities()
    return allCities.filter(city => city.zip.startsWith(str))
  }

  showSuggestions(results, inputVal) {
    let list = '';
    console.log("res", results)
    if (results.length > 0) {
      const reg = new RegExp(inputVal)
      console.log(reg);
      results.find((term) => {
        if (term.zip.match(reg)) {
          console.log("term", term)
          list += `<li data=${JSON.stringify(term)}>${term.zip}</li>`;
        }
      });
    } else {
      this.suggestionField.innerHTML = '';
    }

    this.suggestionField.innerHTML = '<ul>' + list + '</ul>';


  }


  async initForm() {
    if ((this.zip = this.root.querySelector('#zip'))) this.createSuggestionField(this.zip, 'zip-suggestion')
    if ((this.city = this.root.querySelector('#city'))) this.city.setAttribute('disabled', true)
    if ((this.street = this.root.querySelector('#street'))) this.street.setAttribute('disabled', true)
  }

  async getCities() {
    try {
      // @ts-ignore
      // const response = await fetch(`${self.Environment.getApiBaseUrl('zadb')}/umbraco/api/BetriebsrestaurantZadbApi/GetAllCities`)
      // const cities = await response.json()
      // console.log("...",cities)
      const dummyCities = [
        {
          "id": 3647,
          "name": "Aadorf",
          "name_long": "Aadorf",
          "zip": "8355",
          "zip_extension": "00",
          "municipality_id": 4551,
          "canton": "TG",
          "language_id": 1,
          "country_iso": "CH"
        },
        {
          "id": 43,
          "name": "Aarau",
          "name_long": "Aarau",
          "zip": "8350",
          "zip_extension": "00",
          "municipality_id": 4001,
          "canton": "AG",
          "language_id": 1,
          "country_iso": "CH"
        },
        {
          "id": 51,
          "name": "Aarau",
          "name_long": "Aarau",
          "zip": "8351",
          "zip_extension": "00",
          "municipality_id": 4001,
          "canton": "AG",
          "language_id": 1,
          "country_iso": "CH"
        },
        {
          "id": 48,
          "name": "Aarau 1",
          "name_long": "Aarau 1",
          "zip": "8001",
          "zip_extension": "00",
          "municipality_id": 4001,
          "canton": "AG",
          "language_id": 1,
          "country_iso": "CH"
        },
        {
          "id": 148,
          "name": "AAA",
          "name_long": "AAA",
          "zip": "0001",
          "zip_extension": "00",
          "municipality_id": 4001,
          "canton": "AG",
          "language_id": 1,
          "country_iso": "CH"
        }]
      //return dummyCities.map(city => city.zip)
      return dummyCities
    } catch (error) {
      console.log('There was a problem: ', error)
    }
  }

  createSuggestionField(parentNode, fieldId) {
    this.suggestionField = document.createElement('div')
    this.suggestionField.setAttribute("id", fieldId)
    this.suggestionField.setAttribute("class", "suggestion")
    parentNode.after(this.suggestionField)
  }

  useSuggestion(e) {
    console.log("set!", e.target.innerText, e.target.getAttribute('data'))
    
    this.dispatchEvent(new CustomEvent('updateFormValue', {
      detail: {
        data: JSON.parse(e.target.getAttribute('data')) 
      },
      bubbles: true,
      cancelable: true,
      composed: true
    }))
  }

}
