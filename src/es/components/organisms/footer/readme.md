# Footer

**Path:** `../src/es/components/organisms/footer/Footer.js`

## Summary

n/a

## Integration

n/a

## Templates (Namespace)

| Namespace | Path |
|------|------|
| footer-default- | `./default-/default-.css` |

## Attributes

| Attribute Name | Description |
|----------------|-------------|
| `namespace` |  |

## CSS Styles

### Selector: `:host`


### Selector: `:host > footer`

| Property | Variable | Default |
|----------|----------|----------|
| margin | --footer-margin | 0 |
| width | --footer-width | auto |

### Selector: `:host > footer > *, :host > footer .invert > *`

| Property | Variable | Default |
|----------|----------|----------|
| padding | --footer-any-padding | 0 |
| margin | --content-spacing | unset |
| /* Warning! Keep horizontal margin at auto, otherwise the content width + margin may overflow into the scroll bar */
        width | --content-width | 55% |

### Selector: `:host > footer a.logo`


### Selector: `:host > footer .invert`

| Property | Variable | Default |
|----------|----------|----------|
| color | --invert-color |  |
| --a-color-hover | --invert-a-color-hover |  |
| --a-color | --invert-color |  |
| --color | --invert-color |  |
| background-color | --invert-background-color |  |

### Selector: `:host > footer .invert.orange`

| Property | Variable | Default |
|----------|----------|----------|
| color | --invert-orange-color | var(--invert-color |
| --a-color-hover | --invert-orange-a-color-hover | var(--invert-a-color-hover |
| --a-color | --invert-orange-a-color | var(--invert-a-color |
| background-color | --invert-orange-background-color | var(--invert-background-color |

### Selector: `:host > footer o-wrapper[namespace=footer-default-]`

| Property | Variable | Default |
|----------|----------|----------|
| --gap | --gap-custom | var(--content-spacing |
| --justify-content | --justify-content-custom | left |

### Selector: `:host > footer .language-switcher > ul, :host > footer .footer-links > ul`

| Property | Variable | Default |
|----------|----------|----------|
| --color | --background-color |  |
| --color-hover | --m-orange-300 |  |

### Selector: `:host > footer .footer-links > ul`

| Property | Variable | Default |
|----------|----------|----------|
| justify-content | --justify-content-custom | start |
| align-items | --align-items | start |

### Selector: `:host > footer .footer-links > ul > li:last-child`

| Property | Variable | Default |
|----------|----------|----------|
| align-self | --footer-copyright-align-self-custom | end |

### Selector: `:host > footer .language-switcher > ul > li, :host > footer .footer-links > ul > li`

| Property | Variable | Default |
|----------|----------|----------|
| list-style | --list-style | none |
| padding | --content-spacing |  |

### Selector: `:host > footer .seperator > ul > li:not(:last-child)`

| Property | Variable | Default |
|----------|----------|----------|
| border-right | --a-color | black |

### Selector: `:host > footer .language-switcher > ul > li:first-child, :host > footer .footer-links > ul:not(.has-copyright) > li:first-child`


### Selector: `:host > footer .language-switcher > ul > li:last-child, :host > footer .footer-links > ul > li:last-child`


### Selector: `/* force copyright to be at first position desktop */
      :host > footer .footer-links > ul > li.copyright`

| Property | Variable | Default |
|----------|----------|----------|
| order | --order-custom | -1 |
| padding | --content-spacing |  |

### Selector: `/* in case copyright and language are supposed to be on the same line on desktop */
      :host > footer .copyright-and-language`

| Property | Variable | Default |
|----------|----------|----------|
| gap | --content-spacing |  |

### Selector: `:host > footer .copyright-and-language .footer-links ~ .language-switcher > ul`


### Selector: `@media only screen and (max-width: _max-width_)`

| Property | Variable | Default |
|----------|----------|----------|
| width | --footer-width-mobile | var(--footer-width |

### Selector: `:host > footer > *, :host > footer .invert > *`

| Property | Variable | Default |
|----------|----------|----------|
| padding | --footer-any-padding-mobile | var(--footer-any-padding |
| margin | --content-spacing-mobile | var(--content-spacing |
| /* Warning! Keep horizontal margin at auto, otherwise the content width + margin may overflow into the scroll bar */
          width | --content-width-mobile | calc(100% - var(--content-spacing-mobile |

### Selector: `:host > footer *.last-contains-details`

| Property | Variable | Default |
|----------|----------|----------|
| margin-top | --wrapper-last-contains-details-margin-top | var(--content-spacing-mobile |
| /* Warning! Keep horizontal margin at auto, otherwise the content width + margin may overflow into the scroll bar */
          margin-bottom | --wrapper-last-contains-details-margin-bottom | var(--content-spacing-mobile |

### Selector: `:host > footer o-wrapper[namespace=footer-default-]`

| Property | Variable | Default |
|----------|----------|----------|
| --gap | --gap-mobile-custom | var(--gap-custom |

### Selector: `:host > footer .language-switcher > ul > li`

| Property | Variable | Default |
|----------|----------|----------|
| padding | --content-spacing-mobile |  |

### Selector: `/* force copyright to be at first position desktop */
        :host > footer .footer-links > ul > li.copyright`


### Selector: `/* in case copyright and language are supposed to be on the same line on desktop */
        :host > footer > .copyright-and-language`

| Property | Variable | Default |
|----------|----------|----------|
| gap | --content-spacing-mobile | var(--content-spacing |

### Selector: `:host > footer .footer-links > ul`

| Property | Variable | Default |
|----------|----------|----------|
| justify-content | --justify-content-mobile-custom | start |
| align-items | --align-items-mobile | start |

### Selector: `:host > footer > .copyright-and-language .footer-links ~ .language-switcher > ul`

| Property | Variable | Default |
|----------|----------|----------|
| gap | --content-spacing-mobile | var(--content-spacing |

### Selector: `:host > footer .footer-links > ul > li, :host > footer > .footer-links > ul > li.copyright`


### Selector: `:host > footer > .copyright-and-language .footer-links ~ .language-switcher > ul > li`


### Selector: `:host > section > *.contains-details > *:not(m-details).clone`


### Selector: `:host > section > *.contains-details > m-details`


### Selector: `:host > section > *.contains-details > *:not(m-details)`


### Selector: `:host > section > *.contains-details > m-details`


### Selector: `:host > section > *.contains-details > *:not(m-details)`


### Selector: `:host > section`


### Selector: `:host > section > *.contains-details > m-details`


### Selector: `:host > section > *.contains-details > *:not(m-details)`


### Selector: `:host > footer hr.next-contains-details, :host > footer div.next-contains-details`


### Selector: `:host .footer-links-row ul, :host .footer-links-row ul.bull`


### Selector: `:host .social-links`


### Selector: `:host .social-links svg`


