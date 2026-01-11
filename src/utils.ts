import { XMLBuilder, XMLParser } from 'fast-xml-parser'

export { parse as tomlParse, stringify as tomlStringify } from 'smol-toml'
export { parse as yamlParse, stringify as yamlStringify } from 'yaml'

const parser = new XMLParser({
  ignoreAttributes: true,
  // cannot add preserveOrder: true here, because it will transform text to textNode object
})
type validationOptions = Parameters<typeof parser.parse>[1]
export function xmlParse(input: string, validationOptions?: validationOptions | boolean): any {
  const result = parser.parse(input, validationOptions)
  removeXmlTextNodes(result)
  return result
}

const builder = new XMLBuilder({
  ignoreAttributes: true,
  format: true,
  indentBy: '  ',
})
export const xmlStringify = builder.build.bind(builder)

export const jsonParse = JSON.parse
export const jsonStringify = JSON.stringify

// remove '#text'
function removeXmlTextNodes(obj: any): void {
  if (typeof obj !== 'object' || obj === null)
    return
  delete obj['#text']
  for (const key in obj) removeXmlTextNodes(obj[key])
}
