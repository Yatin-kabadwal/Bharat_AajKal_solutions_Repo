function template(variables, { tpl }) {
  const iconName = variables.componentName.replace(/^Svg(Fi)?/, '')

  // Modify few svg attributes like width, height, data-name
  const { attributes } = variables.jsx.openingElement
  const newAttr = attributes.filter(function (el) {
    const attr = el.name.name
    if (attr == 'data-name' || attr == 'width' || attr == 'height' || attr == 'xmlns' || attr == 'fill') return false
    return true
  })
  newAttr.push({
    type: 'JSXAttribute',
    name: { type: 'JSXIdentifier', name: 'fill' },
    value: { type: 'StringLiteral', value: 'currentColor' },
  }) // Adds fill="currentColor" to svg
  variables.jsx.openingElement.attributes = newAttr

  if (!attributes.some((el) => el.name.name == 'viewBox')) {
    throw new Error(
      'viewBox has been removed from SVG, please either remove height & width or make them different than in viewbox'
    )
  }

  return tpl`  
  export function ${iconName}(props: React.SVGProps<SVGSVGElement>) {
    return ${variables.jsx}
  }
  `
}

module.exports = template
