import type { IRArrayNode, IRCommentNode, IRDocument, IRNode, IRObjectNode, IRScalarNode } from '../types'
import { Alias, Pair, parseDocument, YAMLMap, YAMLSeq } from 'yaml'

const anchorMap = new Map<string, any[]>()

export function yaml2IR(yaml: string): IRDocument {
  anchorMap.clear()
  const doc = parseDocument(yaml, { merge: true })
  return convertYamlToIRDocument(doc)
}

function convertYamlToIRDocument(
  doc: ReturnType<typeof parseDocument>,
): IRDocument {
  const IRDoc: IRDocument = {
    sourceFormat: 'yaml',
    metadata: {},
    root: [],
  }
  if (!doc.contents) {
    return IRDoc
  }
  insertBeforeCommentIfExist(doc, IRDoc.root)
  insertBeforeCommentIfExist(doc.contents, IRDoc.root)
  const root = convertYamlItems(doc.contents, doc)
  insertCommentIfExist(doc.contents, root)
  insertCommentIfExist(doc, root)

  IRDoc.root = [...IRDoc.root, ...root]
  return IRDoc
}

function convertYamlItems(
  yamlNode: any,
  doc: ReturnType<typeof parseDocument>,
): IRNode[] {
  const items: any[] = yamlNode.items ?? [yamlNode]
  const result: IRNode[] = []

  for (const item of items) {
    if (item instanceof Alias) {
      result.push(...(anchorMap.get(item.source) ?? []))
      continue
    }
    result.push(...convertSingleItem(item, doc))
  }

  return result
}

function convertSingleItem(
  node: any,
  doc: ReturnType<typeof parseDocument>,
): IRNode[] {
  if (node instanceof Pair) {
    const key = node.key
    const keyText = key.toString()

    const nodes: IRNode[] = []
    insertBeforeCommentIfExist(key, nodes)
    const value = node.value
    if (!(value instanceof Alias)) {
      const convertedNodes = convertValueNode(value, keyText, doc)
      nodes.push(...convertedNodes)
      // value maybe an anchor
      if (value.anchor) {
        anchorMap.set(value.anchor, convertedNodes)
      }
    }
    else {
      // is merge
      if (key.source === '<<') {
        const aliasAnchor = anchorMap.get(value.source)!
        nodes.push(...aliasAnchor[0].children)
      }
      else {
        // clone anchor to avoid mutating
        const anchor = [...anchorMap.get(value.source)!]
        if (anchor[0].name) {
          anchor[0] = {
            ...anchor[0],
            name: keyText,
          }
        }
        // value is an alias
        nodes.push(...(anchor ?? []))
      }
    }

    return nodes
  }

  return convertValueNode(node, undefined, doc)
}

function convertValueNode(
  node: any,
  keyName: string | undefined,
  doc: ReturnType<typeof parseDocument>,
): IRNode[] {
  const res: IRNode[] = []
  insertBeforeCommentIfExist(node, res)
  let ir: IRNode
  // Array / Sequence
  if (node instanceof YAMLSeq) {
    ir = {
      type: 'array',
      values: convertYamlItems(node, doc),
    } as IRArrayNode
  }
  else if (node instanceof YAMLMap || node instanceof Pair) {
    ir = {
      type: 'object',
      children: convertYamlItems(node, doc),
    } as IRObjectNode
  }
  else {
    ir = {
      type: 'scalar',
      value: node.value,
    } as IRScalarNode
  }
  keyName && (ir.name = keyName)
  res.push(ir)
  insertCommentIfExist(node, res)
  return res
}

function insertBeforeCommentIfExist(node: Record<string, any>, res: IRNode[]): void {
  if (node.commentBefore) {
    res.push({
      type: 'comment',
      value: node.commentBefore.trim(),
    } as IRCommentNode)
  }
}

function insertCommentIfExist(node: Record<string, any>, res: IRNode[]): void {
  if (node.comment) {
    res.push({
      type: 'comment',
      value: node.comment.trim(),
    } as IRCommentNode)
  }
}
