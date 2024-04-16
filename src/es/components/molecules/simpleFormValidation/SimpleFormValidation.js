// @ts-check
import { SimpleForm } from '../simpleForm/SimpleForm.js'
import { Validation } from '../../prototypes/Validation.js'

/**
 * SimpleForm is a wrapper for a form html tag and allows to choose to ether post the form by default behavior, send it to an api endpoint or emit a custom event
 * Expose Internals does not work with native :valid selector... https://dev.to/stuffbreaker/custom-forms-with-web-components-and-elementinternals-4jaj, solution to turn off the shadow dom of child components
 * As a molecule, this component shall hold Atoms
 *
 * @export
 * @class SimpleFormValidation
 * @type {CustomElementConstructor}
 * @attribute {
 *
 * }
 * @css {
 *
 * }
 */
export default class SimpleFormValidation extends SimpleForm(Validation()) { }
