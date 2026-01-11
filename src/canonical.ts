import type { Format } from './types'
import {
  jsonParse,
  jsonStringify,
  tomlParse,
  tomlStringify,
  xmlParse,
  xmlStringify,
  yamlParse,
  yamlStringify,
} from './utils'

export function parse(input: string, type: Format): any {
  switch (type) {
    case 'xml': return xmlParse(input)
    case 'json':
      return jsonParse(input)
    case 'yaml':
      return yamlParse(input)
    case 'toml':
      return tomlParse(input)
  }
}

export function stringify(obj: any, type: Format): string {
  switch (type) {
    case 'xml': return xmlStringify(obj)
    case 'json': return jsonStringify(obj, null, 2)
    case 'yaml': return yamlStringify(obj)
    case 'toml': return tomlStringify(obj)
  }
}
