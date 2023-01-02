import { describe, expect, it } from 'vitest'
import { parseTextToAst } from '../interpreter'

describe('evaporating cloud tree interpreter', () => {
  describe('parses ast for input', () => {
    it('empty text', async () => {
      const text = ''
      const expected = {
        statements: []
      }
      expect(await parseTextToAst('evaporatingCloud', text)).toStrictEqual(
        expected
      )
    })

    it('with only labels', async () => {
      const text = `
A is "Maximize business performance"
B is "Subordinate all decisions to the financial goal"
C is "Ensure people are in a state of optimal performance"
D is "Subordinate people's needs to the financial goal"
D' is "Attend to people's needs (& let people work)"
      `
      const expected = {
        statements: [
          {
            id: 'A',
            text: 'Maximize business performance',
            type: 'label'
          },
          {
            id: 'B',
            text: 'Subordinate all decisions to the financial goal',
            type: 'label'
          },
          {
            id: 'C',
            text: 'Ensure people are in a state of optimal performance',
            type: 'label'
          },
          {
            id: 'D',
            text: "Subordinate people's needs to the financial goal",
            type: 'label'
          },
          {
            id: "D'",
            text: "Attend to people's needs (& let people work)",
            type: 'label'
          }
        ]
      }
      expect(await parseTextToAst('evaporatingCloud', text)).toStrictEqual(
        expected
      )
    })

    it('with requirement', async () => {
      const text = `
A is "Maximize business performance"
A requires B, "Subordinate all decisions to the financial goal"
      `
      const expected = {
        statements: [
          {
            id: 'A',
            text: 'Maximize business performance',
            type: 'label'
          },
          {
            id1: 'A',
            id2: 'B',
            id2Text: 'Subordinate all decisions to the financial goal',
            type: 'requirement'
          }
        ]
      }
      expect(await parseTextToAst('evaporatingCloud', text)).toStrictEqual(
        expected
      )
    })
    it('with injection on requirement', async () => {
      const text = `
A is "Maximize business performance"
B requires D, "Subordinate people's needs to the financial goal"
inject "Psychological flow triggers"
      `
      const expected = {
        statements: [
          {
            id: 'A',
            text: 'Maximize business performance',
            type: 'label'
          },
          {
            id1: 'B',
            id2: 'D',
            id2Text: "Subordinate people's needs to the financial goal",
            type: 'requirement'
          },
          {
            text: 'Psychological flow triggers',
            type: 'inject'
          }
        ]
      }
      expect(await parseTextToAst('evaporatingCloud', text)).toStrictEqual(
        expected
      )
    })

    it('with injection on conflict', async () => {
      const text = `
D conflicts with D'
inject "Discover they don't conflict"
      `
      const expected = {
        statements: [
          {
            id1: 'D',
            id2: "D'",
            type: 'conflict'
          },
          {
            text: "Discover they don't conflict",
            type: 'inject'
          }
        ]
      }
      expect(await parseTextToAst('evaporatingCloud', text)).toStrictEqual(
        expected
      )
    })
    it('single-line comments', async () => {
      const text = `
      # This is a comment
      `
      const expected = {
        statements: [
          {
            text: ' This is a comment',
            type: 'comment'
          }
        ]
      }
      expect(await parseTextToAst('evaporatingCloud', text)).toStrictEqual(
        expected
      )
    })
  })
})
