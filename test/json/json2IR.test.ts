import { describe, expect, it } from 'vitest'
import { json2IR } from '../../src'

describe('json', () => {
  it('json to IR', () => {
    const json = `
    {
      "key": "value",
      "bareKey": "bare",
      "quoted-key": "quoted",
      "quoted key": "space allowed"
    }
    `
    const root = json2IR(json).root as any
    expect(root).toEqual([
      { type: 'scalar', name: 'key', value: 'value' },
      { type: 'scalar', name: 'bareKey', value: 'bare' },
      { type: 'scalar', name: 'quoted-key', value: 'quoted' },
      { type: 'scalar', name: 'quoted key', value: 'space allowed' },
    ])
  })
})
