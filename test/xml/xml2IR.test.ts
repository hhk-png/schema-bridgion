import type { IRObjectNode } from 'src/types'
import { describe, expect, it } from 'vitest'
import { xml2IR } from '../../src/xml/xml2IR'

describe('xml2IR', () => {
  it('should parse instruction node and root comment node correctly', () => {
    const xml = `
<?xml version="1.0"?>
<?elementnames <fred>, <bert>, <harry> ?>
`
    const res = xml2IR(xml)
    expect(res.sourceFormat).toBe('xml')
    expect(res.metadata).toEqual({
      '?xml': { version: 1 },
      '?elementnames': { '<fred>,': true, '<bert>,': true, '<harry>': true },
    })
    expect(res.root.length).toBe(0)
  })

  it('parse root comment node correctly', () => {
    const xml = `<!-- Student details   --><!--  -->`
    const res = xml2IR(xml)
    expect(res.root).toEqual([
      { type: 'comment', value: 'Student details' },
      { type: 'comment', value: '' },
    ])
  })

  it('parse root node', () => {
    const xml = `
      <root id="2">
        <item id:a=" 1">
          23
          <subitem id="22" id="name ">sub</subitem>
          <subitem>   sub   </subitem>
        </item>
        <!-- Student details -->
      </root>
    `
    const res = xml2IR(xml)
    expect(res.root).toEqual([
      {
        type: 'object',
        name: 'root',
        attrs: {
          id: 2,
        },
        children: [
          {
            type: 'object',
            name: 'item',
            attrs: {
              'id:a': 1,
            },
            children: [
              {
                type: 'text',
                value: '23',
              },
              {
                type: 'scalar',
                name: 'subitem',
                attrs: {
                  id: 'name',
                },
                value: 'sub',
              },
              {
                type: 'scalar',
                name: 'subitem',
                attrs: {},
                value: 'sub',
              },
            ],
          },
          {
            type: 'comment',
            value: 'Student details',
          },
        ],
      },
    ])
  })

  it('has multi root node and ', () => {
    const xml = `
      <root>
        <name>ffl</name>
        <name> ffl</name>
      </root>
      <root2>
        <name>ffl</name>
        <all>
          <first id="id"></first>
          <second></second>
        </all>
      </root2>
    `

    /*

    */
    const res = xml2IR(xml)
    expect(res.root).toEqual([
      {
        type: 'object',
        name: 'root',
        attrs: {},
        children: [
          {
            type: 'scalar',
            name: 'name',
            attrs: {},
            value: 'ffl',
          },
          {
            type: 'scalar',
            name: 'name',
            attrs: {},
            value: 'ffl',
          },
        ],
      },
      {
        type: 'object',
        name: 'root2',
        attrs: {},
        children: [
          {
            type: 'scalar',
            name: 'name',
            attrs: {},
            value: 'ffl',
          },
          {
            type: 'object',
            name: 'all',
            attrs: {},
            children: [
              {
                type: 'scalar',
                name: 'first',
                attrs: { id: 'id' },
                value: '',
              },
              {
                type: 'scalar',
                name: 'second',
                attrs: {},
                value: '',
              },
            ],
          },
        ],
      },
    ])
  })

  it('number', () => {
    const xml = `
      <root>
        <a>-0x2f</a>
        <a>006</a>
        <a>6.00</a>
        <a>-01.0E2</a>
        <a>+1212121212</a>
        <a>ABC123</a>
      </root>
    `

    const res = xml2IR(xml)
    expect(res.root).toEqual([
      {
        type: 'object',
        name: 'root',
        attrs: {},
        children: [
          {
            type: 'scalar',
            name: 'a',
            attrs: {},
            value: '-0x2f',
          },
          {
            type: 'scalar',
            name: 'a',
            attrs: {},
            value: '006',
          },
          {
            type: 'scalar',
            name: 'a',
            attrs: {},
            value: 6,
          },
          {
            type: 'scalar',
            name: 'a',
            attrs: {},
            value: '-01.0E2',
          },
          {
            type: 'scalar',
            name: 'a',
            attrs: {},
            value: '+1212121212',
          },
          {
            type: 'scalar',
            name: 'a',
            attrs: {},
            value: 'ABC123',
          },
        ],
      },
    ])
  })

  it('cdata', () => {
    const xml = `
      <root>
        <id:a><![CDATA[abc]]></id:a>
        <a><![CDATA[abc]]></a>
      </root>
    `

    const res = xml2IR(xml)
    expect(res.root).toEqual([
      {
        type: 'object',
        name: 'root',
        attrs: {},
        children: [
          {
            type: 'cdata',
            value: 'abc',
          },
          {
            type: 'cdata',
            value: 'abc',
          },
        ],
      },
    ])
  })

  it('mixed content', () => {
    const xml = `
      <root>
        Hello <b>World</b> !!
      </root>
    `

    const res = xml2IR(xml)
    expect((res.root[0] as IRObjectNode).children).toEqual([
      {
        type: 'text',
        value: 'Hello',
      },
      {
        type: 'scalar',
        name: 'b',
        attrs: {},
        value: 'World',
      },
      {
        type: 'text',
        value: '!!',
      },
    ])
  })

  it('self closing tag and ordered attributes', () => {
    const xml = `
      <xmlns:root>
        <a id="1 & 2"/>
      </xmlns:root>
    `

    const res = xml2IR(xml)
    const children = (res.root[0] as IRObjectNode).children
    expect(children).toEqual([
      {
        type: 'scalar',
        name: 'a',
        attrs: {
          id: '1 & 2',
        },
        value: '',
      },
    ])
  })

  it('ordered attributes and attribute NS prefix', () => {
    const xml = `
      <root>
        <b xmlns:attr2="1 &amp; 2" attr=" a b c "/>
      </root>
    `

    const res = xml2IR(xml)
    const bChild = (res.root[0] as IRObjectNode).children[0] as IRObjectNode
    const bAttrsKeys = Object.keys(bChild.attrs!)
    expect(bAttrsKeys[0]).toBe('xmlns:attr2')
    expect(bAttrsKeys[1]).toBe('attr')
  })

  it('root without content', () => {
    const xml = `
      <root/>
      <root2></root2>
    `

    const res = xml2IR(xml)
    expect(res).toEqual({
      sourceFormat: 'xml',
      metadata: {},
      root: [
        { type: 'object', name: 'root', attrs: {}, children: [] },
        { type: 'object', name: 'root2', attrs: {}, children: [] },
      ],
    })
  })
})
