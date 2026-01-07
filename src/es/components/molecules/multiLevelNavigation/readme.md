# MultiLevelNavigation

**Path:** `../src/es/components/molecules/multiLevelNavigation/MultiLevelNavigation.js`

## Summary

Multi-level navigation component with full accessibility support. Features hierarchical headings for screen readers, ARIA attributes for enhanced navigation experience, and multilingual support for internationalization. Supports both desktop flyout and mobile navigation patterns with keyboard accessibility.

## Integration

The navigation component automatically generates invisible headings (h1, h2, h3) for screen reader users to establish proper navigation structure. All texts can be customized through attributes to support multiple languages.

### Basic Usage

```html
<m-multi-level-navigation>
  <!-- Navigation content -->
</m-multi-level-navigation>
```

### Multilingual Examples

#### German (Deutsch)

```html
<m-multi-level-navigation 
  main-nav-title="Hauptnavigation"
  sub-nav-title="Unternavigation"
  sub-nav-suffix="- Unterbereich"
  mobile-nav-title="Mobile Navigation"
  level-text="Ebene">
  <!-- Results in headings like: "Produkte - Unterbereich", "Unternavigation Ebene 2" -->
</m-multi-level-navigation>
```

#### French (Français)

```html
<m-multi-level-navigation 
  main-nav-title="Navigation principale"
  sub-nav-title="Sous-navigation"
  sub-nav-suffix="- Sous-section"
  mobile-nav-title="Navigation mobile"
  level-text="Niveau">
  <!-- Results in headings like: "Produits - Sous-section", "Sous-navigation Niveau 2" -->
</m-multi-level-navigation>
```

#### Italian (Italiano)

```html
<m-multi-level-navigation 
  main-nav-title="Navigazione principale"
  sub-nav-title="Sotto-navigazione"
  sub-nav-suffix="- Sottosezione"
  mobile-nav-title="Navigazione mobile"
  level-text="Livello">
  <!-- Results in headings like: "Prodotti - Sottosezione", "Sotto-navigazione Livello 2" -->
</m-multi-level-navigation>
```

### WCAG 2.2 AA Compliance

- **1.3.1 Info and Relationships**: Hierarchical heading structure for assistive technologies
- **2.1.1 Keyboard**: Full keyboard navigation support
- **2.4.6 Headings and Labels**: Clear, descriptive headings and labels

### Accessibility Features

The component automatically generates invisible headings for screen reader users:

- **h1**: Main navigation heading
- **h2**: First level sub-navigation (e.g., "Produkte - Unternavigation")
- **h3**: Second level sub-navigation (e.g., "Unternavigation Level 2")

These headings use the `.visually-hidden` class to be accessible to screen readers while remaining invisible to sighted users.

## Templates (Namespace)

| Namespace | Path |
|------|------|

## Attributes

| Attribute Name | Description |
|----------------|-------------|
| `animation-duration` | Duration of animations in milliseconds |
| `no-scroll` | Prevents body scrolling when navigation is open |
| `o-nav-wrapper` | Custom element name for navigation wrapper |
| `navigation-load` | Event name dispatched when navigation is loaded |
| `close-event-name` | Event name to listen for closing navigation |
| `namespace` | CSS namespace for styling variants |
| `media` | Media query breakpoint for desktop/mobile |
| `aria-expanded` | ARIA attribute for expanded state |
| `close-other-flyout` | Event name for closing other flyouts |
| `click-anchor` | Event name for anchor link clicks |
| `load-custom-elements` | Event name for loading custom elements |
| `main-nav-title` | Main navigation heading text for screen readers (default: "Hauptnavigation") |
| `sub-nav-title` | Sub-navigation base text (default: "Unternavigation") |
| `sub-nav-suffix` | Suffix for sub-navigation titles (default: "- Unternavigation") |
| `mobile-nav-title` | Mobile navigation base text (default: falls back to sub-nav-title) |
| `level-text` | Text for level numbering (default: "Level") |

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

