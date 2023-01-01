import { describe, expect, it } from 'vitest'
import { parseTextToAst, checkGoalTreeSemantics } from '../interpreter'

describe('interpreter', () => {
  describe('parses ast for input', () => {
    it('with only goal', async () => {
      const text = 'Goal is "win"'
      const expected = {
        goal: { text: 'win' },
        statements: []
      }
      expect(await parseTextToAst('goalTree', text)).toStrictEqual(expected)
    })

    it('with CSF and NCs', async () => {
      const text = `
      Goal is "win"
      CSF weScore is "We score points"
      CSF theyDont is "Other team doesn't score"

      NC possession is "We get the ball"
      NC shooting is "We shoot the ball accurately"
      NC defense is "We have good defense"

      theyDont requires defense
      weScore requires possession and shooting
      `
      const expected = {
        goal: { text: 'win' },
        statements: [
          {
            id: 'weScore',
            text: 'We score points',
            type: 'CSF'
          },
          {
            id: 'theyDont',
            text: "Other team doesn't score",
            type: 'CSF'
          },
          {
            id: 'possession',
            text: 'We get the ball',
            type: 'NC'
          },
          {
            id: 'shooting',
            text: 'We shoot the ball accurately',
            type: 'NC'
          },
          {
            id: 'defense',
            text: 'We have good defense',
            type: 'NC'
          },
          {
            id: 'theyDont',
            requirements: ['defense'],
            type: 'requirement'
          },
          {
            id: 'weScore',
            requirements: ['possession', 'shooting'],
            type: 'requirement'
          }
        ]
      }
      expect(await parseTextToAst('goalTree', text)).toStrictEqual(expected)
    })
  })
})
