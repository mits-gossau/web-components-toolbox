# web-components-toolbox
The web component toolbox for any CMS but particularly used for [Web Components + Umbraco === Mutobo](http://mutobo.ch/)

## [organize components](https://wiki.migros.net/display/OCC/Web+Components+CMS+Template)

TODO:
- [x] move each web component in its own folder
- [x] reset file setup
- [x] merge src/es/components/web-components-cms-template down
- [x] variablesMigros.css move default styles into body if possible
- [x] body.js css to separate file which can be fetched and setCss through shadow with namespace
- [x] body.js css to import reset.css
- [x] teaser templates by namespace
- [x] tile https://www.betriebsrestaurants-migros.ch/de/referenzen.html
- [x] button 1-4 version (3 + 4 -color-disabled) https://www.figma.com/file/npi1QoTULLWLTGM4kMPUtZ/Components-Universal?node-id=2866%3A55901
- [x] Wrapper.js onresize newly calculate calcColumnWidth
- [x] :host *.bg-color, :host *.bg-color-hover try to make this display inline and with box-shadow analog https://www.betriebsrestaurants-migros.ch/de.html
- [ ] review each component, css Dino + Weedy
- [ ] style.css demo page
- [ ] Template.html fix image path issue http://localhost:4200/src/es/components/web-components-toolbox/docs/Template.html?logo=./src/es/components/atoms/logo/default-/default-.html&nav=./src/es/components/molecules/navigation/default-/default-.html&footer=./src/es/components/organisms/footer/default-/default-.html&content=./src/es/components/atoms/button/primary-/primary-.html
- [ ] Template.html api call to fetch page content for previews
- [ ] https://playwright.dev/ visual regression tests
- [ ] documenter.js to document the web components
- [ ] live-server reload on css file changes