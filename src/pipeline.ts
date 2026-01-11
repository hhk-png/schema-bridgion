import type { Format } from './types'
import { parse, stringify } from './canonical'

export class Converter {
  constructor(private data: any) { }

  from(type: Format, input: string): Converter {
    this.data = parse(input, type)
    return this
  }

  use(fn: (obj: any) => any | void): Converter {
    const result = fn(this.data)
    if (result !== undefined)
      this.data = result
    return this
  }

  to(type: Format): string {
    return stringify(this.data, type)
  }
}
