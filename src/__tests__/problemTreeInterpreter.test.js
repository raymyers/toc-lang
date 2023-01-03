import { describe, expect, it } from 'vitest'
import { parseTextToAst, parseProblemTreeSemantics } from '../interpreter'

describe('problem tree interpreter', () => {
  describe('parses ast for input', () => {
    it('with only UDE', async () => {
      const text = 'UDE b is "badness"'
      const expected = {
        statements: [{ text: 'badness', type: 'UDE', id: 'b' }]
      }
      const expectedSemantics = {
        rankdir: 'BT',
        edges: [],
        nodes: new Map(Object.entries({ b: { key: 'b', label: 'badness' } }))
      }
      const ast = await parseTextToAst('problemTree', text)
      expect(ast).toStrictEqual(expected)
      expect(parseProblemTreeSemantics(ast)).toStrictEqual(expectedSemantics)
    })
    it('with UDE and single cause', async () => {
      const text = `
      UDE b is "badness"
      C c is "cause"
      c causes b
      `
      const expected = {
        statements: [
          { text: 'badness', type: 'UDE', id: 'b' },
          { text: 'cause', type: 'C', id: 'c' },
          { causes: ['c'], type: 'cause', effectId: 'b' }
        ]
      }
      const expectedSemantics = {
        rankdir: 'BT',
        edges: [
          {
            from: 'c',
            to: 'b'
          }
        ],
        nodes: new Map(
          Object.entries({
            b: { key: 'b', label: 'badness' },
            c: { key: 'c', label: 'cause' }
          })
        )
      }
      const ast = await parseTextToAst('problemTree', text)
      expect(ast).toStrictEqual(expected)
      expect(parseProblemTreeSemantics(ast)).toStrictEqual(expectedSemantics)
    })
    it('with UDE and multi-cause', async () => {
      const text = `
      UDE b is "badness"
      C c1 is "cause 1"
      C c2 is "cause 2"
      c1 and c2 cause b
      `
      const expected = {
        statements: [
          { text: 'badness', type: 'UDE', id: 'b' },
          { text: 'cause 1', type: 'C', id: 'c1' },
          { text: 'cause 2', type: 'C', id: 'c2' },
          { causes: ['c1', 'c2'], type: 'cause', effectId: 'b' }
        ]
      }
      const expectedSemantics = {
        rankdir: 'BT',
        edges: [
          {
            from: 'c1',
            to: 'b'
          },
          {
            from: 'c2',
            to: 'b'
          }
        ],
        nodes: new Map(
          Object.entries({
            b: { key: 'b', label: 'badness' },
            c1: { key: 'c1', label: 'cause 1' },
            c2: { key: 'c2', label: 'cause 2' }
          })
        )
      }
      const ast = await parseTextToAst('problemTree', text)
      expect(ast).toStrictEqual(expected)
      expect(parseProblemTreeSemantics(ast)).toStrictEqual(expectedSemantics)
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
      const expectedSemantics = {
        rankdir: 'BT',
        edges: [],
        nodes: new Map(Object.entries({}))
      }
      const ast = await parseTextToAst('problemTree', text)
      expect(ast).toStrictEqual(expected)
      expect(parseProblemTreeSemantics(ast)).toStrictEqual(expectedSemantics)
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
