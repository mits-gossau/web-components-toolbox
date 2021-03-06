# web-components-toolbox
The web component toolbox for any CMS but particularly used for [Web Components + Umbraco === Mutobo](http://mutobo.ch/)

## [organize components](https://wiki.migros.net/display/OCC/Web+Components+CMS+Template)

JS Rules:
- use as little JS as possible. First think, if your problem could be solved with CSS before using JS

CSS Rules:
- no absolute CSS values like px except for borders. Everything has to be relative eg. em, vw, vh, etc.
- variablesCustom.css has to be kept as tiny as possible
- use templates instead of namespace-fallback
- each template must have a local preview
- use _\_max-width_\_ for "@media only screen and (max-width:" selector
- use _\_import-meta-url_\_ for all urls (!important, pass option "importMetaUrl: import.meta.url" to Shadow.js in the constructor to have the viewpoint of the Class inheriting Shadow.js)
- sort css properties and variables alphabetically
- variables naming rule: --{selector aka component aka namespace}-{css property}-{pseudo class or media query name} eg. --p-background-color-hover
- within the component don't use any name spacing eg. component header don't use --header-default-color just use --color the namespace can be added by the Shadow as an html attribute

TODO:
- [ ] redo header and navigation /\drem/, then eliminate all rem values
- [ ] Template.html api call to fetch page content for previews
- [ ] new flex-box wrapper: flex-grow (flex: 1) wrapper with empty children to simulate instead of o-wrapper width approach
- [ ] video lazy loading analog src/es/components/web-components-toolbox/src/es/components/atoms/picture/Picture.js with intersection and data-src
