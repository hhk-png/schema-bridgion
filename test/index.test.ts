import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { convert } from '../src'
import json from './fixtures/json.json'

function filePath(path: string) {
  return resolve(fileURLToPath(import.meta.url), '..', path)
}

function pureStr(str: string) {
  return str.replace(/\s/g, '')
}

// 'xml' | 'json' | 'yaml' | 'toml'
describe('xml to others', async () => {
  const xmlStr = await readFile(filePath('./fixtures/xmlFromJson.xml'), 'utf-8')
  it('xml to xml', () => {
    const result = convert(xmlStr, 'xml', 'xml')
    expect(pureStr(result)).toMatchSnapshot()
  })

  it('xml to json', async () => {
    const result = convert(xmlStr, 'xml', 'json')
    expect(pureStr(result)).toMatchSnapshot()
  })

  it('xml to yaml', async () => {
    const result = convert(xmlStr, 'xml', 'yaml')
    expect(pureStr(result)).toMatchSnapshot()
  })

  it('xml to toml', async () => {
    const result = convert(xmlStr, 'xml', 'toml')
    expect(pureStr(result)).toMatchSnapshot()
  })
})

describe('json to others', () => {
  const jsonStr = JSON.stringify(json)
  it('json to xml', () => {
    const result = convert(jsonStr, 'json', 'xml')
    expect(pureStr(result)).toMatchSnapshot()
  })

  it('json to json', () => {
    const result = convert(jsonStr, 'json', 'json')
    expect(pureStr(result)).toMatchSnapshot()
  })

  it('json to yaml', () => {
    const result = convert(jsonStr, 'json', 'yaml')
    expect(pureStr(result)).toMatchSnapshot()
  })

  it('json to toml', () => {
    const result = convert(jsonStr, 'json', 'toml')
    expect(pureStr(result)).toMatchSnapshot()
  })
})

describe('yaml to others', async () => {
  const yamlStr = await readFile(filePath('./fixtures/yamlFromJson.yaml'), 'utf-8')
  it('yaml to xml', () => {
    const result = convert(yamlStr, 'yaml', 'xml')
    expect(pureStr(result)).toMatchSnapshot()
  })

  it('yaml to json', async () => {
    const result = convert(yamlStr, 'yaml', 'json')
    expect(pureStr(result)).toMatchSnapshot()
  })

  it('yaml to yaml', async () => {
    const result = convert(yamlStr, 'yaml', 'yaml')
    expect(pureStr(result)).toMatchSnapshot()
  })

  it('yaml to toml', async () => {
    const result = convert(yamlStr, 'yaml', 'toml')
    expect(pureStr(result)).toMatchSnapshot()
  })
})

describe('toml to others', async () => {
  const tomlStr = await readFile(filePath('./fixtures/tomlFromJson.toml'), 'utf-8')
  it('toml to xml', () => {
    const result = convert(tomlStr, 'toml', 'xml')
    expect(pureStr(result)).toMatchSnapshot()
  })

  it('toml to json', async () => {
    const result = convert(tomlStr, 'toml', 'json')
    expect(pureStr(result)).toMatchSnapshot()
  })

  it('toml to yaml', async () => {
    const result = convert(tomlStr, 'toml', 'yaml')
    expect(pureStr(result)).toMatchSnapshot()
  })

  it('toml to toml', async () => {
    const result = convert(tomlStr, 'toml', 'toml')
    expect(pureStr(result)).toMatchSnapshot()
  })
})
