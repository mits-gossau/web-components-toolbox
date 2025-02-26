# MultiLevelNavigation

**Path:** `../src/es/components/molecules/multiLevelNavigation/MultiLevelNavigation.js`

## Summary

n/a

## Integration

n/a

## Templates (Namespace)

| Namespace | Path |
|------|------|

## Attributes

| Attribute Name | Description |
|----------------|-------------|
| `animation-duration` |  |
| `no-scroll` |  |
| `o-nav-wrapper` |  |
| `navigation-load` |  |
| `close-event-name` |  |
| `namespace` |  |
| `media` |  |
| `aria-expanded` |  |
| `close-other-flyout` |  |
| `click-anchor` |  |
| `load-custom-elements` |  |

## CSS Styles

### Selector: `/* hide component stuff before it is rendered to avoid the blitz (flashing white) */
    :not(:defined)`


### Selector: `:host`


### Selector: `:host > nav > ul`

| Property | Variable | Default |
|----------|----------|----------|
| align-items | --main-ul-align-items | normal |
| justify-content | --main-ul-justify-content | normal |
| display | --main-ul-display | flex |
| flex-wrap | --flex-wrap | nowrap |
| flex-direction | --flex-direction | row |
| padding | --padding | 0 |
| margin | --margin | 0 |

### Selector: `:host > nav > ul > li`

| Property | Variable | Default |
|----------|----------|----------|
| padding | --li-padding | 0 |

### Selector: `:host > nav > ul > li > div.main-background`

| Property | Variable | Default |
|----------|----------|----------|
| background-color | --m-gray-500 |  |

### Selector: `:host > nav > ul > li.open > div.main-background`


### Selector: `:host > nav > ul > li > div.main-background.hide`


### Selector: `:host > nav > ul > li.active > a:hover > span`

| Property | Variable | Default |
|----------|----------|----------|
| color | --color-hover |  |

### Selector: `:host > nav > ul > li.active > a:after`

| Property | Variable | Default |
|----------|----------|----------|
| background-color | --color-active |  |

### Selector: `:host > nav > ul > li.active > a > span`

| Property | Variable | Default |
|----------|----------|----------|
| color | --color-active |  |

### Selector: `:host > nav > ul > li > a:after`

| Property | Variable | Default |
|----------|----------|----------|
| height | --a-main-border-width |  |

### Selector: `:host > nav > ul > li > a:hover:after`

| Property | Variable | Default |
|----------|----------|----------|
| background-color | --color-active |  |

### Selector: `:host > nav > ul > li > a`

| Property | Variable | Default |
|----------|----------|----------|
| display | --a-main-display | inline |
| color | --color |  |
| padding | --a-main-content-spacing | 14px 10px |
| font-size | --a-main-font-size | 1rem |
| font-weight | --a-main-font-weight | 400 |
| line-height | --a-main-line-height |  |
| text-transform | --a-main-text-transform |  |
| font-family | --a-main-font-family | var(--font-family |
| font-weight | --a-font-weight | var(--font-weight |
| text-align | --a-text-align | left |
| width | --a-width | auto |

### Selector: `:host > nav > ul > li > a > span`

| Property | Variable | Default |
|----------|----------|----------|
| font-weight | --a-main-font-weight | 400 |

### Selector: `:host > nav > ul > li > a:hover,
    :host > nav > ul > li > a:active,
    :host > nav > ul > li > a:focus`

| Property | Variable | Default |
|----------|----------|----------|
| color | --color-hover |  |

### Selector: `:host > nav > ul > li > o-nav-wrapper`

| Property | Variable | Default |
|----------|----------|----------|
| top | --o-nav-wrapper-top | 2em |
| left | --logo-default-width | var(--width |
| width | --logo-default-width | var(--width |
| border-top | --desktop-main-wrapper-border-width | 1px |

### Selector: `:host > nav > ul > li.open > o-nav-wrapper`


### Selector: `:host > nav > ul > li > o-nav-wrapper div.wrapper-background`

| Property | Variable | Default |
|----------|----------|----------|
| background-color | --desktop-main-wrapper-background-color | white |
| width | --desktop-main-wrapper-width | 100vw |
| height | --desktop-main-wrapper-height | 100% |
| position | --desktop-main-wrapper-position | relative |
| left | --desktop-main-wrapper-position-left | 50% |
| right | --desktop-main-wrapper-position-right | 50% |

### Selector: `:host > nav > ul > li > o-nav-wrapper.hide`


### Selector: `:host > nav > ul > li.open > o-nav-wrapper.no-animation`


### Selector: `:host > nav > ul > li.open > o-nav-wrapper div.wrapper-background`


### Selector: `:host > nav > ul > li > o-nav-wrapper > section`

| Property | Variable | Default |
|----------|----------|----------|
| padding | --multi-level-navigation-default-o-nav-wrapper-padding | 2em 0 1.5em 0 |

### Selector: `:host > nav > ul > li > o-nav-wrapper > section > div`

| Property | Variable | Default |
|----------|----------|----------|
| /* this setting is quite fragile here, we need to improve it for reusability */
      width | --gap |  |
| background-color | --sub-navigation-wrapper-background-color | white |

### Selector: `:host > nav > ul > li > o-nav-wrapper > section > div:first-of-type`


### Selector: `:host > nav > ul > li > o-nav-wrapper > section > div:not(:first-of-type)`


### Selector: `:host > nav > ul > li > o-nav-wrapper > section > div:last-of-type`


### Selector: `:host > nav > ul > li > o-nav-wrapper > section > div:not(:last-of-type):after`

| Property | Variable | Default |
|----------|----------|----------|
| background | --multi-level-navigation-default-desktop-main-wrapper-border-color | black |
| width | --multi-level-navigation-default-desktop-main-wrapper-border-width | 1px |

### Selector: `:host > nav > ul > li > o-nav-wrapper > section > div > ul`


### Selector: `:host > nav > ul > li > o-nav-wrapper > section > div:hover > ul::-webkit-scrollbar`

| Property | Variable | Default |
|----------|----------|----------|
| background-color | --multi-level-navigation-default-desktop-sub-navigation-wrapper-scrollbar-background-color | black |

### Selector: `:host > nav > ul > li > o-nav-wrapper > section > div:hover > ul::-webkit-scrollbar-thumb`

| Property | Variable | Default |
|----------|----------|----------|
| background | --multi-level-navigation-default-desktop-sub-navigation-wrapper-scrollbar-thumb-background-color | black |

### Selector: `:host > nav > ul > li > o-nav-wrapper > section .close-icon`

| Property | Variable | Default |
|----------|----------|----------|
| --icon-link-list-color | --color |  |
| --icon-link-list-color-hover | --color |  |

### Selector: `:host > nav > ul > li > o-nav-wrapper > section > div > ul::-webkit-scrollbar`


### Selector: `:host > nav > ul > li > o-nav-wrapper > section > div > ul::-webkit-scrollbar-thumb`


### Selector: `:host > nav > ul > li > o-nav-wrapper > section > div > ul > li.list-title`

| Property | Variable | Default |
|----------|----------|----------|
| --a-color | --color-active |  |
| --a-color-hover | --color-active |  |

### Selector: `:host > nav > ul > li > o-nav-wrapper > section ul li`


### Selector: `:host > nav > ul > li > o-nav-wrapper > section > div > ul > li.list-title > a > span`

| Property | Variable | Default |
|----------|----------|----------|
| color | --color |  |

### Selector: `:host > nav > ul > li > o-nav-wrapper > section > div > ul > li.list-title > a:hover > span`

| Property | Variable | Default |
|----------|----------|----------|
| color | --color-active |  |

### Selector: `:host li.hover-active m-nav-level-item`

| Property | Variable | Default |
|----------|----------|----------|
| --nav-level-item-default-background-color | --nav-level-item-default-hover-background-color |  |

### Selector: `:host li m-nav-level-item`

| Property | Variable | Default |
|----------|----------|----------|
| --color | --a-color |  |

### Selector: `:host > nav > ul > li > o-nav-wrapper`


### Selector: `@media only screen and (max-width: _max-width_)`

| Property | Variable | Default |
|----------|----------|----------|
| --nav-level-item-default-hover-color | --color |  |

