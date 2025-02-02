# Architecture Overview

This document provides an overview of the process of parsing and traversing JavaScript / WebComponent code with Babel to create an Abstract Syntax Tree (AST), traverse nodes and create a JSON file for documentation or to generate further transformations.

## Workflow

![alt text](./architecture-overview.png)

1. Parse the JavaScript Code: Use Babel’s parser to convert JavaScript code into an AST.
2. Traverse the AST: Use Babel’s traverse function to visit each node, collecting data or making modifications as required.
3. Generate JSON Output: Serialize the collected data in a JSON file or for use in other use cases




## Structure

The structure of the `documenter` is as follows:

```
documenter
├── getAttributes.js      - Extracts all attributes => this.getAttribute()
├── getTemplates.js       - Extracts all templates/namespaces from fetchTemplate()
├── getCSSProperties.js   - Extracts all CSS Properties => :host
└── generateModified.js   - Generates a modified version of the given web component
```

## Resources
- [AST Explorer](https://astexplorer.net/)
- [Babel Parser](https://babeljs.io/docs/babel-parser)
- [Babel Generator](https://babeljs.io/docs/babel-generator)
- [Babel Traverse](https://babeljs.io/docs/babel-traverse)