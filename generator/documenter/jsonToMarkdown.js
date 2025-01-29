function jsonToMarkdown(json, fileName) {
    let markdown = ''

    // Component Path
    markdown += `# ${fileName}\n\n`
    markdown += `**Path:** \`${json.path}\`\n\n`

    // Templates
    markdown += `## Templates\n\n`
    markdown += `| Name | Path |\n|------|------|\n`
    json.templates.forEach(template => {
        markdown += `| ${template.name} | \`${template.path}\` |\n`
    })
    markdown += '\n'

    // Attributes
    markdown += `## Attributes\n\n`
    markdown += `| Attribute Name | Description |\n|----------------|-------------|\n`
    json.attributes.forEach(attr => {
        markdown += `| \`${attr.attributeName}\` | ${attr.description || ''} |\n`;
    })
    markdown += '\n'

    // CSS Styles
    markdown += `## CSS Styles\n\n`
    json.css.forEach(style => {
        markdown += `### Selector: \`${style.selector}\`\n\n`
        markdown += `Changeable: ${style.changeable ? 'Yes' : 'No'}\n\n`
        if (style.declaration && style.declaration.length > 0) {
            markdown += `| Property | Variable | Fallback |\n|----------|----------|----------|\n`
            style.declaration.forEach(decl => {
                markdown += `| ${decl.property} | ${decl.variable || ''} | ${decl.fallback || ''} |\n`
            })
        }
        markdown += '\n'
    });

    return markdown
}


module.exports = jsonToMarkdown