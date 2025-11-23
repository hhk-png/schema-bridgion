import { describe, expect, it } from 'vitest'
import { main } from '~xml/xml2IR'

describe('index', () => {
  it('should work', () => {
    main()
    expect(1).toBe(1)
  })
})
