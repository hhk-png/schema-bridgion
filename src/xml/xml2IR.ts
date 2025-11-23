import { XMLParser } from 'fast-xml-parser'

// const xml = `
// <?xml version="1.0"?>
// <?elementnames <fred>, <bert>, <harry> ?>
// <root>
//   <item id:a="1">
//     <subitem>sub</subitem>
//     <subitem>sub</subitem>
//   </item>
//   <!--Student details-->
//   <item2>item2B</item2>
//   <a>-0x2f</a>
//   <a>006</a>
//   <a>6.00</a>
//   <a>-01.0E2</a>
//   <a>+1212121212</a>
//   <a>ABC123</a>
// </root>
// `

//
// Should text outside of tags be ignored?,
// Are tagvalue and attributevalue parsed?

const xml = `
<root>
  <item>
    <subitem>sub</subitem>
  </item>
  <item1>as   </item1>
</root>
`
export function main(): void {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '@_',
    preserveOrder: true,
    textNodeName: '#text',
    allowBooleanAttributes: true,
    cdataPropName: '#cdata',
    commentPropName: '#comment',
    numberParseOptions: {
      leadingZeros: false,
      hex: false,
      skipLike: /\+\d{10}/,
      eNotation: false,
    },
    parseTagValue: true,
    parseAttributeValue: true,
    processEntities: false,
    // should remove namespace prefix from attribute
    removeNSPrefix: true,
    // set config
    // stopNodes: ['root.item'],
    // unused, omit it
    // tagValueProcessor: (tagName, tagValue, jPath, hasAttributes, isLeafNode) => {

    // },
    captureMetaData: true,
  })

  const obj = parser.parse(xml)
  // console.log(JSON.stringify(obj, null, 3))
  return obj
}

/* output：
{
  root: {
    item: [
      { '@_id': '1', '#text': 'A' },
      { '@_id': '2', '#text': 'B' },
      { '@_id': '3', '#text': 'C' }
    ]
  }
}
*/
