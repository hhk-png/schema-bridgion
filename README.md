# Schema Bridgion

## Introduction

Schema Bridgion is a library that enables data conversion between different formats. It supports conversion between JSON, XML, YAML, and TOML formats. The library provides a simple API that allows you to easily convert data from one format to another.

## Installation

You can install Schema Bridgion using npm or pnpm.

```bash
# Install using npm
npm install schema-bridgion

# Install using yarn
pnpm add schema-bridgion
```

## Usage Example

Here's an example of using Schema Bridgion to convert JSON data to XML:

```typescript
import { convert } from 'schema-bridgion'

const input = {
  name: 'Alice',
  age: 28,
  email: 'alice@example.com'
}

const xml = convert(JSON.stringify(input), 'json', 'xml')

console.log(xml)
```

## API

### convert(input: string, from: Format, to: Format): string

Converts input data from one format to another.

- `input`: The data to be converted.
- `from`: The format of the input data, which can be `json`, `xml`, `yaml`, or `toml`.
- `to`: The format of the converted data, which can be `json`, `xml`, `yaml`, or `toml`.

Returns the converted data.

### parse(input: string, type: Format): any

Parses the input string into the JSON format.

- `input`: The input string to be parsed.
- `type`: The format of the input string, which can be 'xml', 'json', 'yaml', or 'toml'.

Returns the parsed data.

### stringify(obj: any, type: Format): string

Converts the input object into the corresponding data format.

- `obj`: The input object to be converted.
- `type`: The format of the output data, which can be 'xml', 'json', 'yaml', or 'toml'.

Returns the converted string.

## Contributions

If you'd like to contribute to Schema Bridgion, you can submit a pull request to help improve the library. You can find the repository on [GitHub](https://github.com/hhk-png/schema-bridgion).

## License

Schema Bridgion is licensed under the [MIT License](https://opensource.org/licenses/MIT).
