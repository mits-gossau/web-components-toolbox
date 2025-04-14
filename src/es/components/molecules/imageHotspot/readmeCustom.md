# ImageHotspot

> ImageHotspot.

- [JIRA](https://jira.migros.net/browse/MIDUWEB-1564)
- [Figma](https://www.figma.com/design/PZlfqoBJ4RnR4rjpj38xai/Design-System-Core-%7C%C2%A0Klubschule-Master?node-id=12843-115898&t=sX9KINAoBhIcT82l-4)
- [Example](https://github.com/mits-gossau/web-components-toolbox-klubschule/tree/dev/src/es/components/atoms/hotspot/Hotspot.html)
- [Demo](https://mits-gossau.github.io/web-components-toolbox-klubschule/src/es/components/web-components-toolbox/docs/TemplateMiduweb.html?rootFolder=src&css=./src/css/variablesCustomKlubschule.css&login=./src/es/components/molecules/login/default-/default-.html&logo=./src/es/components/atoms/logo/default-/default-.html&nav=./src/es/components/web-components-toolbox/src/es/components/molecules/multiLevelNavigation/default-/default-.html&footer=./src/es/components/organisms/footer/default-/default-.html&content=./src/es/components/atoms/hotspot/Hotspot.html)

## CMS Integration as child of main or any other parent
```
<m-image-hotspot>
  <!--{a-picture}-->
  <!--{a-hotspot's}-->
</m-image-hotspot>
```

## CMS Integration as child of < ks-o-body-section > *(background support)*
- m-image-hotspot must be set within a div
```
<ks-o-body-section variant="default" background="var(--mdx-sys-color-accent-6-subtle1)" has-background>
  <div>
    <m-image-hotspot>
      <!--{a-picture}-->
      <!--{a-hotspot's}-->
    </m-image-hotspot>
  </div>
</ks-o-body-section>
```

## CMS Integration a-picture within m-image-hotspot
- set the attribute picture-load
- use the namespace picture-hotspot-
- use multiple modal attributes to open the m-image-hotspot within a modal
- set a template tag with attribute open-modal within the a-picture tag. This allows a custom icon for opening this component inside the modal (lightbox)
```
<a-picture picture-load namespace="picture-hotspot-" alt="Dergarten" defaultSource="../../web-components-toolbox/src/es/components/molecules/imageHotspot/derGarten.jpg" open-modal no-open-modal-desktop open-modal-mobile open-modal-target-query="m-image-hotspot">
  <template open-modal>
    <ks-a-button icon namespace="button-secondary-" color="primary"><a-icon-mdx icon-name="Maximize" size="1.5em"></a-icon-mdx></ks-a-button>
  </template>
</a-picture>
```

## CMS Integration a-hotspot within m-image-hotspot
- set the position of the hotspot through the attributes top and left
- the place attribute is optional and tells the hotspot where to place the info text
- when using links as hotspots, leave the div with the class content empty else fill it as seen in the section (OPTIONAL: CMS Integration div.content within a-hotspot) below
- optional: set a template tag and insert the desired components as hotspots. Here we got a class btn-close and a class btn-open ks-a-button in the example below.
- optional: use an element which supports target and href as hotspot when using the hotspot as link
```
<a-hotspot top="33.777777777777779" left="73" place="bottom">
  <div class="content"></div>
  <template>
    <ks-a-button href="./rockMeBaby.html" target="_blank" class="btn-close" icon namespace="button-secondary-" color="secondary"><a-icon-mdx icon-name="ArrowRight" size="1em"></a-icon-mdx></ks-a-button>
    <ks-a-button href="./rockMeBaby.html" target="_blank" class="btn-open" icon namespace="button-primary-" color="secondary"><a-icon-mdx icon-name="ArrowRight" size="1em"></a-icon-mdx></ks-a-button>
  </template>
</a-hotspot>
```

### OPTIONAL: CMS Integration div.content within a-hotspot
- fill the content with an h3 tag and a following article with the proper divs and classes included
```
<div class="content">
  <h3>Walk of Fame</h3>
  <article>
    <div class="hotspot-inner">
      <div class="hotspot-content-wrapper">
        <div class="hotspot-content ui-js-hotspot-content is-bottom" aria-hidden="false">
          <div class="hotspot-text text-area">
            <p>Gut. Besser. Am besten. Die Eigenproduktion der Migros.</p>
          </div>
        </div>
      </div>
    </div>
  </article>
</div>
```

### Parent web components
1. ks-o-body-section [component](https://github.com/mits-gossau/web-components-toolbox-klubschule/tree/master/src/es/components/organisms/bodySection)

### Child web components
1. ks-a-picture [component](https://github.com/mits-gossau/web-components-toolbox-klubschule/tree/master/src/es/components/atoms/picture)
2. a-hotspot [component](https://github.com/mits-gossau/web-components-toolbox-klubschule/tree/master/src/es/components/web-components-toolbox/src/es/components/atoms/hotspot/)
3. ks-a-button [readme](https://github.com/mits-gossau/web-components-toolbox-klubschule/blob/master/src/es/components/atoms/button/readme.md)

### Attribute variations on m-image-hotspot (check out example page above):
1. **only-show-hotspot-in-modal**: optional `has` Hides the hotspots when not opened inside the modal for desktop
2. **only-show-hotspot-in-modal-mobile**: optional `has` Hides the hotspots when not opened inside the modal for mobile
3. **scroll-image-in-modal**: optional `has` Keeps the image at full size in the modal but allows scroll of the overflow for desktop
4. **scroll-image-in-modal-mobile**: optional `has` Keeps the image at full size in the modal but allows scroll of the overflow for mobile

### Attribute variations on a-picture (check out example page above):
1. **open-modal**: optional `has` Allows the component to be opened inside a modal (lightbox)
2. **no-open-modal-desktop"**: optional `has` Suppress open modal for desktop
3. **open-modal-mobile**: optional `has` Allow open modal for mobile (requires attribute open-modal to be set)
4. **open-modal-target-query="m-image-hotspot**: optional `has` When a-picture is clicked, the target query selector to open component in modal. Here it is the m-image-hotspot, so that the whole component opens inside the modal.

### Conclusion Miduca
The custom example can be found under the title "Open in Modal, Miduca Version!". There are couple attributes to trigger the desired behavior with opening the m-image-hotspot in a modal (lightbox). Also, a-picture has a template[open-modal]-tag to change the open indication icon on the picture. This can be set as a button component, with its own specific settings. Similarly, the template tag within a-hotspot lets you also define the btn-close and btn-open by using the button component. Further details can be found in the specific child components description.