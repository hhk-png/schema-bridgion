import type { IRArrayNode, IRDocument, IRNode, IRObjectNode, IRScalarNode } from '../types'
import { parse, TomlDate } from 'smol-toml'

export function jsonLikeToIR(str: string, sourceFormat: 'json' | 'toml'): IRDocument {
  const res: IRDocument = {
    sourceFormat,
    metadata: {},
    root: [],
  }
  const tomlAST = sourceFormat === 'toml' ? parse(str) : JSON.parse(str)
  const root = convertJSONLikeToIRRoot(tomlAST) as any
  res.root = root.children
  return res
}

export function convertJSONLikeToIRRoot(tomlAST: any, name?: string): IRNode {
  if (tomlAST instanceof TomlDate) {
    return {
      type: 'scalar',
      name,
      value: tomlAST.toString(),
    } as IRScalarNode
  }
  else if (Array.isArray(tomlAST)) {
    const nodes: IRNode[] = []
    for (const val of tomlAST) {
      nodes.push(convertJSONLikeToIRRoot(val))
    }
    return {
      type: 'array',
      name,
      values: nodes,
    } as IRArrayNode
  }
  else if (typeof tomlAST === 'object' && tomlAST !== null) {
    const nodes: IRNode[] = []
    for (const key in tomlAST) {
      nodes.push(convertJSONLikeToIRRoot(tomlAST[key], key))
    }
    return {
      type: 'object',
      name,
      children: nodes,
    } as IRObjectNode
  }
  else {
    return {
      type: 'scalar',
      name,
      value: tomlAST,
    } as IRScalarNode
  }
}
