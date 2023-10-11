// @ts-check
import { Shadow } from '../../prototypes/Shadow.js'

/**
 * GoogleTagManager
 * An example at: docs/TemplateMigrosPro.html
 *
 * @export
 * @class GoogleTagManager
 * @type {CustomElementConstructor}
 * @attribute {
 *  {string} gtm-id
 *  {head|body} [position=head] position of the web component
 * }
 * @examples {
    <head>
     ...
      <c-google-tag-manager gtm-id="GTM-PNK6BD2V"></c-google-tag-manager>
    </head>
    <body>
      <c-google-tag-manager gtm-id="GTM-PNK6BD2V" position="body"></c-google-tag-manager>
      ...
    </body>
 * }
 */

export default class GoogleTagManager extends Shadow() {
  connectedCallback() {
    const gtmId = this.getAttribute("gtm-id") || "GTM-XXXXXX";
    const position = this.getAttribute("position") || "head"; // default to 'head' if no attribute is provided

    // Construct the GTM script
    const script = document.createElement("script");
    script.textContent = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start': new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0], j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');`;

    // Append the GTM script to the desired position
    if (position === "head") {
      document.head.appendChild(script);
    } else if (position === "body") {
      document.body.appendChild(script);
    }

    // Add the noscript part to the body
    const noscript = document.createElement("noscript");
    const iframe = document.createElement("iframe");
    iframe.src = `https://www.googletagmanager.com/ns.html?id=${gtmId}`;
    iframe.height = "0";
    iframe.width = "0";
    iframe.style.display = "none";
    iframe.style.visibility = "hidden";
    noscript.appendChild(iframe);
    this.appendChild(noscript);
  }
}
