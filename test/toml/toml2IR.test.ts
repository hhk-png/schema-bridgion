import { describe, expect, it } from 'vitest'
import { toml2IR } from '../../src'

describe('toml', () => {
  it('empty', () => {
    const toml = ``
    const root = toml2IR(toml).root
    expect(root).toEqual([])
  })

  it('basic key-value', () => {
    const toml = `
      key = "value"
      bareKey = "bare"
      quoted-key = "quoted"
      "quoted key" = "space allowed"
    `
    const root = toml2IR(toml).root
    expect(root).toEqual([
      { type: 'scalar', name: 'key', value: 'value' },
      { type: 'scalar', name: 'bareKey', value: 'bare' },
      { type: 'scalar', name: 'quoted-key', value: 'quoted' },
      { type: 'scalar', name: 'quoted key', value: 'space allowed' },
    ])
  })

  it('string', () => {
    const toml = `
      basic_string = "Hello World TOML"
      unicode_string = "你好，世界 🌍"

      literal_string = 'C:/Users/Toml/test.txt'
      multiline_basic = """
      Line 1
      Line 2
      Line 3
      """

      multiline_literal = '''
      Line A
      Line B
      Line C
      '''
    `
    const root = toml2IR(toml).root
    expect(root).toMatchSnapshot()
  })

  it('number', () => {
    const toml = `
      int_decimal = 42
      int_negative = -42
      int_underscore = 1_000_000

      int_hex = 0xDEADBEEF
      int_octal = 0o755
      int_binary = 0b11010110

      float_decimal = 3.14159
      float_exponent = 1e6
      float_negative_exp = -2E-2
      float_underscore = 9_224_617.445_991_228

      float_inf = inf
      float_neg_inf = -inf
      float_nan = nan
    `
    const root = toml2IR(toml).root
    expect(root).toEqual([
      { type: 'scalar', name: 'int_decimal', value: 42 },
      { type: 'scalar', name: 'int_negative', value: -42 },
      { type: 'scalar', name: 'int_underscore', value: 1000000 },
      { type: 'scalar', name: 'int_hex', value: 3735928559 },
      { type: 'scalar', name: 'int_octal', value: 493 },
      { type: 'scalar', name: 'int_binary', value: 214 },
      { type: 'scalar', name: 'float_decimal', value: 3.14159 },
      { type: 'scalar', name: 'float_exponent', value: 1000000 },
      { type: 'scalar', name: 'float_negative_exp', value: -0.02 },
      {
        type: 'scalar',
        name: 'float_underscore',
        value: 9224617.445991227,
      },
      { type: 'scalar', name: 'float_inf', value: Infinity },
      { type: 'scalar', name: 'float_neg_inf', value: -Infinity },
      { type: 'scalar', name: 'float_nan', value: Number.NaN },
    ])
  })

  it('bool', () => {
    const toml = `
      bool_true = true
      bool_false = false
    `
    const root = toml2IR(toml).root
    expect(root).toEqual([
      { type: 'scalar', name: 'bool_true', value: true },
      { type: 'scalar', name: 'bool_false', value: false },
    ])
  })

  it('date', () => {
    const toml = `
      local_date = 2025-01-01
      local_time = 12:34:56.789
      local_datetime = 2025-01-01T12:34:56
      offset_datetime = 2025-01-01T12:34:56+08:00
      utc_datetime = 2025-01-01T04:34:56Z
    `
    const root = toml2IR(toml).root
    expect(root.length).toBe(5)
  })

  it('array', () => {
    const toml = `
      int_array = [1, 2, 3]
      mixed_array = [1, "two", false, 3.0]
      nested_array = [[1, 2], [3, 4]]

      multiline_array = [
        "red",
        "green",
        "blue",
      ]
    `
    const root = toml2IR(toml).root
    expect(root[1]).toEqual({
      type: 'array',
      name: 'mixed_array',
      values: [
        {
          type: 'scalar',
          value: 1,
        },
        {
          type: 'scalar',
          value: 'two',
        },
        {
          type: 'scalar',
          value: false,
        },
        {
          type: 'scalar',
          value: 3,
        },
      ],
    })
    expect(root[2]).toEqual({
      type: 'array',
      name: 'nested_array',
      values: [
        {
          type: 'array',
          values: [
            {
              type: 'scalar',
              value: 1,
            },
            {
              type: 'scalar',
              value: 2,
            },
          ],
        },
        {
          type: 'array',
          values: [
            {
              type: 'scalar',
              value: 3,
            },
            {
              type: 'scalar',
              value: 4,
            },
          ],
        },
      ],
    })
  })

  it('inline table', () => {
    const toml = `
      inline_table = { x = 1, y = 2 }
      inline_nested = { point = { x = 10, y = 20 } }
    `
    const root = toml2IR(toml).root
    expect(root[1]).toEqual({
      type: 'object',
      name: 'inline_nested',
      children: [
        {
          type: 'object',
          name: 'point',
          children: [
            {
              type: 'scalar',
              name: 'x',
              value: 10,
            },
            {
              type: 'scalar',
              name: 'y',
              value: 20,
            },
          ],
        },
      ],
    })
  })

  it('table', () => {
    const toml = `
      [server]
      host = "localhost"
      port = 8080
      enabled = true

      [server.tls]
      enabled = true
      cert = "/etc/ssl/cert.pem"
    `
    const root = toml2IR(toml).root
    expect(root).toEqual([
      {
        type: 'object',
        name: 'server',
        children: [
          {
            type: 'scalar',
            name: 'host',
            value: 'localhost',
          },
          {
            type: 'scalar',
            name: 'port',
            value: 8080,
          },
          {
            type: 'scalar',
            name: 'enabled',
            value: true,
          },
          {
            type: 'object',
            name: 'tls',
            children: [
              {
                type: 'scalar',
                name: 'enabled',
                value: true,
              },
              {
                type: 'scalar',
                name: 'cert',
                value: '/etc/ssl/cert.pem',
              },
            ],
          },
        ],
      },
    ])
  })

  it('array of tables', () => {
    const toml = `
      [[users]]
      id = 1
      name = "Alice"
      roles = ["admin", "user"]

      [[users]]
      id = 2
      name = "Bob"
      roles = ["user"]
    `
    const root: any = toml2IR(toml).root
    expect(root[0].values.length).toBe(2)
    expect(root[0].values[1].children).toEqual([
      {
        type: 'scalar',
        name: 'id',
        value: 2,
      },
      {
        type: 'scalar',
        name: 'name',
        value: 'Bob',
      },
      {
        type: 'array',
        name: 'roles',
        values: [
          {
            type: 'scalar',
            value: 'user',
          },
        ],
      },
    ])
  })

  it('nested array of tables', () => {
    const toml = `
      [[products]]
      name = "Widget"

        [[products.variants]]
        sku = "W-RED"
        price = 9.99

        [[products.variants]]
        sku = "W-BLUE"
        price = 10.99
    `
    const root = toml2IR(toml).root
    expect(root).toMatchSnapshot()
  })

  it('comments and whitespace', () => {
    const toml = `
    
      # This is a full-line comment
      commented_value = "value" # End-of-line comment

    `
    const root = toml2IR(toml).root
    expect(root).toEqual([{ type: 'scalar', name: 'commented_value', value: 'value' }])
  })

  it('empty table', () => {
    const toml = `
      [empty]
    `
    const root = toml2IR(toml).root
    expect(root).toEqual([{ type: 'object', name: 'empty', children: [] }])
  })

  it('unicode and Emoji', () => {
    const toml = `
      emoji = "🔥🚀"
      foreign_key = "ключ значение"
    `
    const root = toml2IR(toml).root
    expect(root).toEqual([
      { type: 'scalar', name: 'emoji', value: '🔥🚀' },
      { type: 'scalar', name: 'foreign_key', value: 'ключ значение' },
    ])
  })
})
