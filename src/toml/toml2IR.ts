import type { IRDocument } from '../types'
import { jsonLikeToIR } from '../shared/JSON2IR'

export function toml2IR(toml: string): IRDocument {
  return jsonLikeToIR(toml, 'toml')
}
