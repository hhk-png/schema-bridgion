export type IRNode
  = IRObjectNode
    | IRCommentNode
    | IRScalarNode
    | IRTextNode
    | IRCDATANode
    | IRArrayNode

// null is existed in yaml
export type Scalar = string | number | boolean | null

// object node
export interface IRObjectNode {
  type: 'object'
  // if there is no name, it means that it is an array in an array, but not in object
  name?: string
  // XML attributes, such as <a id="1">
  attrs?: Record<string, Scalar>
  // sub nodes（orderly）
  children: IRNode[]
}

// scalar value
export interface IRScalarNode {
  type: 'scalar'
  // if there is no name, it means that it is an array in an array, but not in object
  name?: string
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

// specified in yaml
export interface IRArrayNode {
  // if there is no name, it means that it is an array in an array, but not in object
  name?: string
  type: 'array'
  value: IRNode[]
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

// Object node stores its value in children key
// Array node stores its value in value key
