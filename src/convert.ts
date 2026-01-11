import type { Format } from './types'
import { parse, stringify } from './canonical'

export function convert(options: {
  input: string
  from: Format
  to: Format
}): string {
  const json = parse(options.input, options.from)
  return stringify(json, options.to)
}
