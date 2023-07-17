# web-components-toolbox
The web component toolbox for any CMS but particularly used for [Web Components + Umbraco === Mutobo](http://mutobo.ch/)

## [organize components](https://wiki.migros.net/display/OCC/Web+Components+CMS+Template)

Install:
- git submodule update --init --recursive --force
  (don't use the --remote flag, https://git-scm.com/book/en/v2/Git-Tools-Submodules)
- npm install

Previews:
- https://mits-gossau.github.io/web-components-toolbox/

JS Rules:
- use as little JS as possible. First think, if your problem could be solved with CSS before using JS
- Component should share its breakpoint with children

CSS Rules:
- mobile font-size should not be smaller than 1rem
- no absolute CSS values like px except for borders. Everything has to be relative eg. em, vw, vh, etc.
- variablesCustom.css has to be kept as tiny as possible
- use templates instead of namespace-fallback
- each template must have a local preview
- ONE breakpoint strategy!
- use _\_max-width_\_ for "@media only screen and (max-width:" selector
- use _\_import-meta-url_\_ for all urls (!important, pass option "importMetaUrl: import.meta.url" to Shadow.js in the constructor to have the viewpoint of the Class inheriting Shadow.js) / Example [NewsPreview.js](https://github.com/mits-gossau/web-components-toolbox/blob/master/src/es/components/contentful/newsPreview/NewsPreview.js#L7)
- sort css properties and variables alphabetically
- variables naming rule: --{selector aka component aka namespace}-{css property}-{pseudo class or media query name} eg. --p-background-color-hover
- within the component don't use any name spacing eg. component header don't use --header-default-color just use --color the namespace can be added by the Shadow as an html attribute
- avoid overly use of reassigning / overwrite variables
- the default transition is: 0.3s ease-out

HTML/CSS Tooling:
- vscode extensions: es6-string-html & es6-string-css

## Master Branch locked 🙌

Checklist for each component:
- [ ] Note date of cleaning/overhaul, fix comments, fix all type/file errors of red highlighted files, + ("return Promise.resolve" to async function)
- [x] Transform mouseEventElement (mouseover|mouseout) hover on parent to prototype Hover.js class
- [x] Remove fetchCSS.then replace and use replaces property
- [x] Split the Template Switch/Case into a separate function, that it can be overwritten by components which extend it
- [x] Change the loadChildComponents function to use the Shadow.js fetchModules
- [x] transform all import.meta.url.replace(/(.*\/)(.*)$/, '$1') to this.importMetaUrl

TODO:
- [ ] playwright single component tests
- [ ] documenter.js / automatic story book documentation by comments
- [ ] Template.html api call to fetch page content for previews (playwright or https://github.com/Rob--W/cors-anywhere)
- [ ] redo header and navigation /\drem/, then eliminate all rem values (tbd @miduca)
- [ ] rework the reset.css with the new learnings from https://medium.com/appwrite-io/css-layers-for-css-resets-f60f270aa1cd
- [ ] print.css and some ideas from here https://alvaromontoro.hashnode.dev/css-tip-style-your-radio-buttons-and-checkboxes-for-printing?utm_source=newsletter&utm_medium=email&utm_campaign=wdrl-309
- [ ] scroll timeout solutions replaced by scrollend https://developer.chrome.com/blog/scrollend-a-new-javascript-event/?utm_source=newsletter&utm_medium=email&utm_campaign=wdrl-310