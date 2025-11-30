import type {
  IRCDATANode,
  IRCommentNode,
  IRDocument,
  IRNode,
  IRObjectNode,
  IRScalarNode,
  IRTextNode,
  Scalar,
} from 'src/types'
import { XMLParser } from 'fast-xml-parser'

export function xml2IR(xml: string): IRDocument {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    preserveOrder: true,
    textNodeName: '#text',
    allowBooleanAttributes: true,
    cdataPropName: '#cdata',
    commentPropName: '#comment',
    numberParseOptions: {
      leadingZeros: false,
      hex: false,
      skipLike: /\+\d{10}/,
      eNotation: false,
    },
    parseTagValue: true,
    parseAttributeValue: true,
    // should convert &lt; to <, etc.
    processEntities: false,
    // should remove namespace prefix from attribute
    // removeNSPrefix: true,
  })

  const parsed = parser.parse(xml)
  const ir = convertToIRDocument(parsed)

  return ir
}

export function convertToIRDocument(parsedNodes: any[]): IRDocument {
  const res: IRDocument = {
    sourceFormat: 'xml',
    metadata: {},
    root: [],
  }
  for (let i = 0; i < parsedNodes.length; i++) {
    const node: Record<string, any> = parsedNodes[i]

    // is comment node
    if (node['#comment']) {
      res.root.push(createCommentNode(valueToString(node['#comment'][0]['#text'])))
      continue
    }

    // attributes' key is :@
    const attrs = convertAttributes(node[':@'])
    let isInstruction = false
    // is instruction node
    for (const key in node) {
      if (key.startsWith('?')) {
        res.metadata[key] = attrs
        isInstruction = true
        // instruction node have no children
        break
      }
    }
    // now, the instruction node has been processed
    if (isInstruction)
      continue

    for (const key in node) {
      if (key === ':@' || key.startsWith('?') || key.startsWith('#'))
        continue
      res.root.push({
        type: 'object',
        name: key,
        attrs,
        children: convertChildren(node[key]),
      } as IRObjectNode)
    }
  }

  return res
}

function convertChildren(children: Record<string, any>[]): IRNode[] {
  const res = [] as IRNode[]
  for (const child of children) {
    // comment node
    if (child['#comment']) {
      res.push(createCommentNode(valueToString(child['#comment'][0]['#text'])))
      continue
    }
    // text node
    if (child['#text']) {
      res.push(createTextNode(valueToString(child['#text'])))
      continue
    }

    const attrs = convertAttributes(child[':@'])
    for (const key in child) {
      // continue instruction node, comment node, text node and attributes
      if (key === ':@' || key.startsWith('?') || key.startsWith('#'))
        continue

      // scalar node without content
      if (child[key].length === 0) {
        res.push(createScalarNode(key, attrs, ''))
        continue
      }

      if (child[key].length === 1) {
        // scalar node
        if (child[key][0]['#text']) {
          res.push(createScalarNode(key, attrs, trimScalar(child[key][0]['#text'])))
        }
        // cdata node
        if (child[key][0]['#cdata']) {
          res.push(createCDATANode(child[key][0]['#cdata'][0]['#text']))
        }
        continue
      }
      res.push(createObjectNode(key, attrs, convertChildren(child[key])))
    }
  }
  return res
}

function createObjectNode(name: string, attrs: Record<string, Scalar>, children: IRNode[]): IRObjectNode {
  return {
    type: 'object',
    name,
    attrs,
    children,
  }
}

function createScalarNode(name: string, attrs: Record<string, Scalar>, value: Scalar): IRScalarNode {
  return {
    type: 'scalar',
    name,
    attrs,
    value,
  }
}

function createCDATANode(value: string): IRCDATANode {
  return { type: 'cdata', value }
}

function createTextNode(value: string): IRTextNode {
  return { type: 'text', value }
}

function convertAttributes(attributes: Record<string, any>): Record<string, any> {
  const attrs: Record<string, any> = {}
  for (const key in attributes) {
    // ignore :@
    attrs[key.slice(2)] = attributes[key]
  }
  return attrs
}

function createCommentNode(value: string): IRCommentNode {
  return { type: 'comment', value }
}

function trimScalar(value: Scalar): Scalar {
  return typeof value === 'string' ? value.trim() : value
}

function valueToString(value: Scalar): string {
  const temp = typeof value === 'string' ? value : value.toString()
  return temp.trim()
}
