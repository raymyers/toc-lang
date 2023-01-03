import { describe, expect, it } from 'vitest'
import { parseTextToAst, parseProblemTreeSemantics } from '../interpreter'

const testCases = [
  {
    name: 'with only UDE',
    text: 'UDE b is "badness"',
    expectedAst: {
      statements: [{ text: 'badness', type: 'UDE', id: 'b' }]
    },
    expectedSemantics: {
      rankdir: 'BT',
      edges: [],
      nodes: new Map(
        Object.entries({ b: { key: 'b', label: 'badness', annotation: 'UDE' } })
      )
    }
  },
  {
    name: 'with UDE and single cause',
    text: `
    UDE b is "badness"
    C c is "cause"
    c causes b
    `,
    expectedAst: {
      statements: [
        { text: 'badness', type: 'UDE', id: 'b' },
        { text: 'cause', type: 'C', id: 'c' },
        { causes: ['c'], type: 'cause', effectId: 'b' }
      ]
    },
    expectedSemantics: {
      rankdir: 'BT',
      edges: [
        {
          from: 'c',
          to: 'b'
        }
      ],
      nodes: new Map(
        Object.entries({
          b: { key: 'b', label: 'badness', annotation: 'UDE' },
          c: { key: 'c', label: 'cause' }
        })
      )
    }
  },
  {
    name: 'with UDE and multi-cause',
    text: `
    UDE b is "badness"
    C c1 is "cause 1"
    C c2 is "cause 2"
    c1 and c2 cause b
    `,
    expectedAst: {
      statements: [
        { text: 'badness', type: 'UDE', id: 'b' },
        { text: 'cause 1', type: 'C', id: 'c1' },
        { text: 'cause 2', type: 'C', id: 'c2' },
        { causes: ['c1', 'c2'], type: 'cause', effectId: 'b' }
      ]
    },
    expectedSemantics: {
      rankdir: 'BT',
      edges: [
        {
          from: 'c1_c2_cause_b',
          to: 'b'
        },
        {
          from: 'c1',
          to: 'c1_c2_cause_b'
        },
        {
          from: 'c2',
          to: 'c1_c2_cause_b'
        }
      ],
      nodes: new Map(
        Object.entries({
          b: { key: 'b', label: 'badness', annotation: 'UDE' },
          c1: { key: 'c1', label: 'cause 1' },
          c2: { key: 'c2', label: 'cause 2' },
          c1_c2_cause_b: {
            intermediate: true,
            key: 'c1_c2_cause_b',
            label: 'AND'
          }
        })
      )
    }
  },
  {
    name: 'single-line comments',
    text: `
    # This is a comment
    `,
    expectedAst: {
      statements: [
        {
          text: ' This is a comment',
          type: 'comment'
        }
      ]
    },
    expectedSemantics: {
      rankdir: 'BT',
      edges: [],
      nodes: new Map(Object.entries({}))
    }
  }
]

describe('problem tree interpreter', () => {
  describe('parses ast for input', () => {
    testCases.forEach((testCase) => {
      it(testCase.name, async () => {
        const ast = await parseTextToAst('problemTree', testCase.text)
        expect(ast).toStrictEqual(testCase.expectedAst)
        expect(parseProblemTreeSemantics(ast)).toStrictEqual(
          testCase.expectedSemantics
        )
      })
    })

    it('fails for cause referencing unknown node', async () => {
      const text = `
      UDE b is "badness"
      C c is "cause"
      c causes d
      `
      const expected = {
        statements: [
          { text: 'badness', type: 'UDE', id: 'b' },
          { text: 'cause', type: 'C', id: 'c' },
          { causes: ['c'], type: 'cause', effectId: 'd' }
        ]
      }
      const ast = await parseTextToAst('problemTree', text)
      expect(ast).toStrictEqual(expected)
      expect(() => parseProblemTreeSemantics(ast)).toThrowError()
    })
  })
})
