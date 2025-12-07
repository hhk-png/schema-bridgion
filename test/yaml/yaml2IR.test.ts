import type { IRArrayNode, IRCommentNode, IRObjectNode, IRScalarNode } from '../../src'
import { describe, expect, it } from 'vitest'
import { yaml2IR } from '../../src/yaml/yaml2IR'

describe('yaml2IR', () => {
  it('basic keys and tail comment', async () => {
    const yaml = `
      # ======================================
      # Basic keys (unquoted)
      # ======================================
      name: Tom
      age: 28
      # ======================================
      height: 1.82
      # ======================================
      # Basic keys (unquoted)
      # ======================================
    `
    const root = yaml2IR(yaml).root as any
    expect(root.length).toBe(6)
    // comment
    expect(root[0].value.length).toBe(101)
    expect(root[0].value).toBe(root[5].value)
    expect(root[1].value).toBe('Tom')
    expect(root[2].value).toBe(28)
    expect(root[2].name).toBe('age')
    expect(root[4].value).toBe(1.82)
  })

  it('quota keys', () => {
    const yaml = `
      # ======================================
      # Quoted keys (contain spaces or special characters)
      # ======================================
      "full name": "Tom Smith"
      "file.ext": "example.txt"
      "key with: colon": "value"
    `
    const root = yaml2IR(yaml).root
    expect(root.length).toBe(4)
    expect((<IRScalarNode>root[1]).name).toBe('full name')
    expect((<IRScalarNode>root[2]).name).toBe('file.ext')
    expect((<IRScalarNode>root[3]).name).toBe('key with: colon')
  })

  it('complex keys', () => {
    const yaml = `
      # ======================================
      # Complex keys
      # ======================================
      ? [a, b, c]
      : "complex list key"

      ? { x: 1, y: 2 }
      : "complex object key"
    `
    const root = yaml2IR(yaml).root
    expect(root.length).toBe(3)
    expect((<IRScalarNode>root[1]).name).toBe('["a","b","c"]')
    expect((<IRScalarNode>root[2]).name).toBe('{"x":1,"y":2}')
    expect((<IRCommentNode>root[1]).value).toBe('complex list key')
    expect((<IRCommentNode>root[2]).value).toBe('complex object key')
  })

  it('numeric keys', () => {
    const yaml = `
      # ======================================
      # Numeric values
      # ======================================
      int_value: 123
      float_value: 3.14159
      hex_value: 0xFF
      octal_value: 0755
    `
    const root = yaml2IR(yaml).root
    expect(root.length).toBe(5)
    expect((<IRScalarNode>root[1]).value).toBe(123)
    expect((<IRScalarNode>root[2]).value).toBe(3.14159)
    expect((<IRScalarNode>root[3]).value).toBe(255)
    expect((<IRScalarNode>root[4]).value).toBe(755)
  })

  it('boolean values', () => {
    const yaml = `
      # ======================================
      # Boolean values (multiple forms)
      # ======================================
      bool_true_1: true
      bool_true_2: True
      bool_true_3: YES
      bool_true_4: on
      bool_false_1: false
      bool_false_2: FALSE
      bool_false_3: no
      bool_false_4: Off
    `
    const root = yaml2IR(yaml).root
    expect(root.length).toBe(9)
    expect((<IRScalarNode>root[1]).value).toBe(true)
    expect((<IRScalarNode>root[2]).value).toBe(true)
    expect((<IRScalarNode>root[3]).value).toBe('YES')
    expect((<IRScalarNode>root[5]).value).toBe(false)
    expect((<IRScalarNode>root[6]).value).toBe(false)
    expect((<IRScalarNode>root[8]).value).toBe('Off')
  })

  it('null values', () => {
    const yaml = `
      # ======================================
      # Null values (multiple forms)
      # ======================================
      null_1: null
      null_2: Null
      null_3: NULL
      null_4: ~
      null_5:
    `
    const root = yaml2IR(yaml).root
    expect(root.length).toBe(6)
    expect((<IRScalarNode>root[1]).value).toBe(null)
    expect((<IRScalarNode>root[2]).value).toBe(null)
    expect((<IRScalarNode>root[3]).value).toBe(null)
    expect((<IRScalarNode>root[4]).value).toBe(null)
    expect((<IRScalarNode>root[5]).value).toBe(null)
  })

  it('string values', () => {
    // yaml is not support escapes, such as double_quoted: 'Hello\nworld'
    const yaml = `
      # ======================================
      # String values
      # ======================================
      # Single-quoted string
      single_quoted: 'Hello world'

      # Double-quoted string (supports escapes)
      double_quoted: "Hello world"

      # Plain string
      plain_string: HelloWorld

      # Literal block scalar (keeps line breaks)
      literal_block: |
        line 1
        line 2
        line 3

      # Folded block scalar (folds line breaks)
      folded_block: >
        This is a long
        long line
        that will be folded
        into a single line.
    `

    const root = yaml2IR(yaml).root
    expect(root.length).toBe(10)
    expect((<IRScalarNode>root[1]).value).toBe('Hello world')
    expect((<IRScalarNode>root[3]).value).toBe('Hello world')
    expect((<IRScalarNode>root[5]).value).toBe('HelloWorld')
    expect((<IRScalarNode>root[7]).value).toBe('line 1\nline 2\nline 3\n')
    expect((<IRScalarNode>root[9]).value).toBe('This is a long long line that will be folded into a single line.\n')
  })

  it('arrays', () => {
    const yaml = `
      # ======================================
      # Arrays (sequences)
      # ======================================

      # Inline array
      inline_list: [1, 2, 3]

      # Block array
      block_list:
        - apple
        - banana
        - orange

      # Complex array items
      complex_list:
        - name: Tom
          age: 20
        - name: Jerry
          age: 18

      matrix:
        - [1, 2, 3]
        - 
          - [10, 11]
          - [20, 21]
    `

    const root = yaml2IR(yaml).root
    expect(root.length).toBe(7)
    // inline_list
    expect((<IRArrayNode>root[1]).name).toBe('inline_list')
    const root1Value = (<IRArrayNode>root[1]).value
    expect(root1Value.length).toBe(3)
    expect(root1Value[2]).toEqual({ type: 'scalar', value: 3 })
    // block_list
    const root3Value = (<IRArrayNode>root[3]).value
    expect(root3Value.length).toBe(3)
    expect(root3Value[1]).toEqual({ type: 'scalar', value: 'banana' })
    // complex_list
    const root5Value: any = (<IRArrayNode>root[5]).value
    expect(root5Value[1]).toEqual({
      type: 'object',
      children: [
        {
          type: 'scalar',
          name: 'name',
          value: 'Jerry',
        },
        {
          type: 'scalar',
          name: 'age',
          value: 18,
        },
      ],
    })
    // matrix
    const root6Value: any = (<IRArrayNode>root[6]).value
    expect(root6Value[1].value[1]).toEqual({
      type: 'array',
      value: [
        {
          type: 'scalar',
          value: 20,
        },
        {
          type: 'scalar',
          value: 21,
        },
      ],
    })
  })

  it('objects', () => {
    const yaml = `
      person:
        # comment
        name: "Alice"
        age: 30
    `

    const root = yaml2IR(yaml).root
    expect(root.length).toBe(2)
    expect((<IRObjectNode>root[1]).children).toEqual([
      {
        type: 'scalar',
        name: 'name',
        value: 'Alice',
      },
      {
        type: 'scalar',
        name: 'age',
        value: 30,
      },
    ])
  })

  it('inline object', () => {
    const yaml = `inline_object: { a: 1, b: 2 }`

    const root = yaml2IR(yaml).root
    expect(root.length).toBe(1)
    expect((<IRObjectNode>root[0]).children).toEqual([
      {
        type: 'scalar',
        name: 'a',
        value: 1,
      },
      {
        type: 'scalar',
        name: 'b',
        value: 2,
      },
    ])
  })

  it('dates and timestamps', () => {
    const yaml = `
      date_value: 2024-01-10
      datetime_value: 2024-01-10T12:30:45Z
    `
    const root = yaml2IR(yaml).root
    expect(root.length).toBe(2)
    expect((<IRScalarNode>root[0]).value).toBe('2024-01-10')
    expect((<IRScalarNode>root[1]).value).toBe('2024-01-10T12:30:45Z')
  })

  it('simple nested object', () => {
    const yaml = `
      nested_object:
        profile:
          name: "Nested Tom"
          contact:
            email: tom@example.com
            phone: 123456789
          address:
            city: "New York"
            zip: 10101
    `
    const root = yaml2IR(yaml).root
    expect(root.length).toBe(1)
    expect((<IRObjectNode>root[0]).children.length).toBe(1)
    // @ts-expect-error type is wrong
    expect((<IRObjectNode>root[0]).children[0].children.length).toBe(3)
    // @ts-expect-error type is wrong
    expect((<IRObjectNode>root[0]).children[0].children[1].children.length).toBe(2)
    // @ts-expect-error type is wrong
    expect((<IRObjectNode>root[0]).children[0].children[2].children).toEqual([
      {
        name: 'city',
        type: 'scalar',
        value: 'New York',
      },
      {
        name: 'zip',
        type: 'scalar',
        value: 10101,
      },
    ])
  })

  it('object containing nested lists', () => {
    const yaml = `
      object_with_lists:
        # comment
        tags:
          - developer
          - writer
          - gamer
        scores:
          - 95
          - 88
          - 76
    `

    const root = yaml2IR(yaml).root
    expect(root.length).toBe(2)
    expect((<IRObjectNode>root[1]).children.length).toBe(2)
    // @ts-expect-error type is wrong
    expect((<IRObjectNode>root[1]).children[0].value.length).toBe(3)
    // @ts-expect-error type is wrong
    expect((<IRObjectNode>root[1]).children[1].value.length).toBe(3)
  })

  it('list containing nested objects', () => {
    const yaml = `
      list_of_objects:
        - id: 1
          info:
            name: "Alice"
            hobbies:
              - reading
              - dancing
        - id: 2
          info:
            name: "Bob"
            hobbies:
              - coding
              - chess
    `

    const root = yaml2IR(yaml).root
    // @ts-expect-error type is wrong
    expect((<IRObjectNode>root[0]).value.length).toBe(2)
    // @ts-expect-error type is wrong
    expect((<IRObjectNode>root[0]).value[0].children.length).toBe(2)
    // @ts-expect-error type is wrong
    expect((<IRObjectNode>root[0]).value[1].children[1].children[1].value).toEqual([
      {
        type: 'scalar',
        value: 'coding',
      },
      {
        type: 'scalar',
        value: 'chess',
      },
    ])
  })

  it('mixed nested structure', () => {
    const yaml = `
      deep_nested:
        level1:
          level2:
            list:
              - type: fruit
                items:
                  - apple
                  - banana
                  - orange
              - type: animal
                items:
                  - dog
                  - cat
                  - bird
            settings:
              enabled: true
              timeout: 5000
          meta:
            created_at: 2024-01-01
            created_by: "system"
    `

    const root = yaml2IR(yaml).root
    expect(root).toMatchSnapshot()
  })

  // TODO: template
  // TODO: comment
})
