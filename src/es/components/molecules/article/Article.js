// @ts-check
import { Shadow } from '../../prototypes/Shadow.js'


export default class Article extends Shadow() {
  constructor(...args) {
    super(...args)


  }

  connectedCallback() {
    console.log("article connected....");

  }

  disconnectedCallback() {

  }


}
