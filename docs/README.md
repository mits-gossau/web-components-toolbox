# Documentation for web-components-toolbox
The web-components-toolbox is a framework designed for creating and managing web components, particularly tailored for use with the Umbraco content management system. This documentation outlines the installation process, component organization, development guidelines, and additional tools to help developers effectively utilize the toolbox.

## Table of Contents:
- Installation
- Development Guidelines
  - Component Rules
  - Event-Driven Architecture
  - JavaScript Practices
  - CSS Standards
- Additional Tools and Features
- Extending Web API Standards with Shadow.js
- CSS Name Spacing
- Diagram
- Conclusion

## Installation
To set up the web-components-toolbox, follow these steps:
- Clone the Repository:
    - ```git clone https://github.com/mits-gossau/web-components-toolbox.git```
- Serve the index.html through a web server eg.: apache or install npm development dependencies, which include live-server:
    - ```npm install```
    - ```npm run serve```

### Other Npm Commands:
- generate a new component: ```npm run make```
- generate a preview from an url: ```npm run download-template-preview```
Further commands can be found in the [package.json](https://github.com/mits-gossau/web-components-toolbox/blob/master/package.json)

## Development Guidelines
## [Rules](https://github.com/mits-gossau/web-components-toolbox/blob/master/README.md?plain=1#L18)
### Component Rules
Components should share their breakpoints with their children. If a component requires web components as children, it must define them using ```fetchModules```. Rendering should be triggered at the connectedCallback, ensuring checks are in place to avoid multiple renderings by functions as ```shouldRender``` and using ```this.hidden``` to make the components appear nicely. Add event listeners in the connectedCallback and remove them in the disconnectedCallback accordingly and synchronously.

### Event-Driven Architecture
Controllers must not query-select or output any CSS or HTML directly; communication should strictly occur through events. Data can only be passed down from parent component to child via constructors or attributes during creation time, otherwise their communication must occur through dispatching and listening to events.

### JavaScript Practices
Minimize JavaScript usage; prefer CSS solutions where applicable. Regularly run the linter to maintain code quality. Use JSDoc annotations for documentation. Ensure that event listeners are added and removed in a timely manner.

### CSS Standards
Avoid double dashes in CSS selectors or variable names. Do not use inline styles outside of web components or templates loaded by web components. Use relative units for sizing (e.g., em, vw, vh). Maintain a minimal size for variablesCustom.cSS. Follow a consistent naming convention for CSS variables (e.g., --{component}-{property}-{pseudo-class}).

## Additional Tools and Features
### Recommended Extensions
For enhanced development experience, consider using VS Code Extensions: es6-string-html and es6-string-cSS.

## Extending Web API Standards with Shadow.js
### Overview
The Shadow.js file in the web-components-toolbox serves as a foundational component that can be extended by a custom web components class and extends the Web API standards by default extending HTMLElement by itself. By implementing a custom element that utilizes the Shadow DOM, it enhances encapsulation and modularity, creating a simple yet robust base for building reusable web components with minimal overhead.

### Key Features
1. Shadow DOM Implementation
    Encapsulation: The Shadow.js file creates a shadow root for the custom element, which isolates its styles and markup from the global document. This encapsulation ensures that styles defined within the component do not interfere with external styles, providing a clean and predictable styling environment. By changing the attribute mode or as an property mode at the option argument when using new constructor, the shadow dom can be set 'open' or 'false'. 'false' ensures that the cSS falls back from the ```:host``` selector to id, if applicable, or else node name.
2. Custom Element Definition
    Defining Custom Elements: The file defines a custom element using the customElements.define() method. This allows you to create new HTML tags that can be used throughout your HTML documents, enhancing reusability and maintainability. Each custom element encapsulates its behavior and presentation logic, simplifying complex UI component management. The [wc-config.js](https://github.com/mits-gossau/web-components-toolbox/blob/master/wc-config.js#L196) is a web component loader, which optionally helps to load and define the in html found custom elements by it's definition dictionary and naming rules.

### Core Base of the Toolbox
1. Lightweight Architecture
    Minimal Overhead: By adhering to Web API standards and utilizing native browser features like the Shadow DOM, the toolbox maintains a lightweight architecture. This design choice minimizes performance overhead compared to other frameworks that may rely on more complex rendering engines or virtual DOM implementations.
2. Optional CSS Name Spacing
    Dynamic CSS Management: The optional CSS name spacing feature allows you to scope CSS variables based on HTML node attributes. This flexibility enables you to define styles specific to particular instances of components without extensive modifications to the underlying codebase. Regex functions are used for name spacing, ensuring that variable names remain unique while being easy to manage.
3. Simplified Development Process
    Ease of Use: The combination of shadow DOM encapsulation and custom element definitions simplifies your development process. You can focus on building components without worrying about style conflicts or complex lifecycle management, as these concerns are inherently handled by the web component standards. Shadow.js supplies handlers like the html setter ```this.html = '<span>...</span>'``` or the cSS setter ```this.css = ':host{...}'``` to make the development experience as enjoyable as with a framework.

## CSS Name Spacing
### Overview
In the web-components-toolbox, name spacing for CSS is achieved through a structured approach that utilizes regular expressions (regex) to ensure that CSS variables are unique and follow a specific naming convention. This method helps prevent conflicts and maintains clarity in styles, especially when dealing with multiple components.

### Overview of Name Spacing
The name spacing strategy typically involves prefixing CSS variables with a component-specific identifier. This practice ensures that styles are scoped correctly to their respective components, reducing the risk of unintended overrides or style leaks.

### Regex Functions in Name Spacing
In the [provided code snippet](https://github.com/mits-gossau/web-components-toolbox/blob/master/src/es/components/prototypes/Shadow.js#L300) from Shadow.js, regex functions are employed to manipulate CSS variable names.

### CSS Variable Generation:
A regex pattern is used to format the CSS variable names based on the component's name. For instance, if the component is named myComponent, the regex transforms it into --my-component-{property} where {property} represents a specific style property related to that component.

Styling Components: In the component's stylesheet, use the defined CSS variables to style elements. For example:
    ```
    .my-component {
        font-size: var(--{namespaces gets injected if available by Shadow.js}font-size, 1em);
        height: var(--{namespaces gets injected if available by Shadow.js}height, auto);
    }
    ```

### Benefits of Using Regex for Name Spacing
- Consistency: Ensures that all CSS variables follow a uniform naming convention.
- Avoids Conflicts: Reduces the likelihood of variable clashes between different components.
- Maintainability: Makes it easier to manage and update styles as components evolve.

### Conclusion
The use of regex functions for name spacing in CSS variables within the web-components-toolbox enhances modularity and maintainability of styles across web components. By following a systematic approach to naming conventions, developers can create more robust and conflict-free stylesheets.

## Diagram
graph TD;
    A[web-components-toolbox] --> B[Custom Elements]
    A --> C[Shadow DOM]
    A --> D[CSS Management]
    A --> E[Development Guidelines]
    
    B --> F[Component Definition]
    B --> G[Event Handling]
    
    C --> H[Encapsulation]
    C --> I[Scoped Styles]

    D --> J[CSS Variables]
    D --> K[Name Spacing]

    E --> L[Component Rules]
    E --> M[JavaScript Practices]
    E --> N[CSS Standards]

## Conclusion
The Shadow.js file exemplifies how extending Web API standards for web components can lead to an effective framework for building reusable UI elements. By leveraging features like shadow DOM and custom elements, along with optional CSS name spacing, the web-components-toolbox provides a robust foundation for modern web development with minimal overhead. This approach enhances modularity and maintainability while aligning with best practices in web component architecture. This documentation serves as a comprehensive guide for developers looking to utilize the web-components-toolbox, detailing installation procedures, development practices, and insights into extending core web standards through custom implementations like Shadow.js.
