export type IRNode
  = IRObjectNode | IRCommentNode | IRScalarNode | IRTextNode | IRCDATANode

export type Scalar = string | number | boolean

// object node
export interface IRObjectNode {
  type: 'object'
  name: string
  // XML attributes, such as <a id="1">
  attrs: Record<string, Scalar>
  // sub nodes（orderly）
  children: IRNode[]
}

// scalar value
export interface IRScalarNode {
  type: 'scalar'
  name: string
  attrs: Record<string, Scalar>
  value: Scalar
}

export interface IRCDATANode {
  type: 'cdata'
  value: string
}

export interface IRTextNode {
  type: 'text'
  value: string
}

export interface IRCommentNode {
  type: 'comment'
  value: string
}

/**
 * root document
 */
export interface IRDocument {
  // document root node
  root: IRNode[]

  // source format (xml/json/yaml/toml)
  sourceFormat: 'xml' | 'json' | 'yaml' | 'toml'

  // comments and line break styles. need to be detailed
  metadata: Record<string, any>
}
