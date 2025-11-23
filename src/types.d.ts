export type IRNode
  = | IRObjectNode
    | IRArrayNode
    | IRValueNode

export interface IRBase {
  // node name（comes from XML tag，JSON/YAML/TOML, is null if no name）
  name?: string | null

  // comment（only YAML / TOML / XML）
  comments?: string[]
}

// object node
export interface IRObjectNode extends IRBase {
  type: 'object'

  // XML attributes, such as <a id="1">
  attributes?: Record<string, IRValueNode>

  // sub nodes（orderly）
  children: Record<string, IRNode>
}

// array nodes
export interface IRArrayNode extends IRBase {
  type: 'array'

  // ordered array
  items: IRNode[]
}

// scalar value
export interface IRSchalarNode extends IRBase {
  type: 'value'
  value: string | number | boolean | null
}

/**
 * root document
 */
export interface IRDocument {
  // document root node
  root: IRNode

  // source format (xml/json/yaml/toml)
  sourceFormat?: 'xml' | 'json' | 'yaml' | 'toml'

  // comments and line break styles. need to be detailed
  metadata?: Record<string, any>
}
