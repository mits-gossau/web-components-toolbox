function jsonToMarkdown(json, fileName) {
    let markdown = ''

    // Component Path
    markdown += `# ${fileName}\n\n`
    markdown += `**Path:** \`${json.path}\`\n\n`

    // Summary
    markdown += `## Summary\n\n`
    markdown += `${json.metaData.summary}\n\n`

    // Integration
    markdown += `## Integration\n\n`
    markdown += json.metaData.integration === 'n/a' ? 'n/a\n\n' :  '```html\n' + `${json.metaData.integration}\n` + '```\n\n'  

    // Templates
    markdown += `## Templates (Namespace)\n\n`
    markdown += `| Namespace | Path |\n|------|------|\n`
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
        if (style.declaration && style.declaration.length > 0) {
            markdown += `| Property | Variable | Default |\n|----------|----------|----------|\n`
            style.declaration.forEach(decl => {
                // TODO: Refactor this when we get a PSP budget
                // Until then: "Works On My Machine"
                markdown += `| ${decl.property} | ${decl.allCssVars[0] || ''} | ${decl.defaultValue || ''} |\n`
            })
        }
        markdown += '\n'
    });

    return markdown
}


module.exports = jsonToMarkdown