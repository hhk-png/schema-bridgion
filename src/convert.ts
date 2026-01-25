import type { Format } from './types'
import { parse, stringify } from './canonical'

export function convert(input: string, from: Format, to: Format): string {
  const json = parse(input, from)
  return stringify(json, to)
}
