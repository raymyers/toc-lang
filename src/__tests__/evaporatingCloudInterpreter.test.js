import { describe, expect, it } from "vitest"
import { parseTextToAst } from "../interpreter"
import { exampleEvaporatingCloudText } from "../examples"

describe("evaporating cloud tree interpreter", () => {
  describe("parses ast for input", () => {
    it("only type line parses to empty", async () => {
      const text = "type: conflict"
      const expected = {
        statements: []
      }
      expect((await parseTextToAst(text)).ast).toStrictEqual(expected)
    })

    it("empty text throws type missing", async () => {
      const text = ""
      await expect(parseTextToAst(text)).rejects.toThrow(
        "Type declaration missing"
      )
    })

    it("with only labels", async () => {
      const text = `
type: conflict
A: Maximize business performance
B: Subordinate all decisions to the financial goal
C: Ensure people are in a state of optimal performance
D: Subordinate people's needs to the financial goal
D': Attend to people's needs (& let people work)
      `
      const expected = {
        statements: [
          {
            id: "A",
            text: "Maximize business performance",
            type: "node",
            params: {},
            labelRange: {
              start: { line: 3, column: 4, offset: 19 },
              end: { line: 3, column: 33, offset: 48 }
            }
          },
          {
            id: "B",
            text: "Subordinate all decisions to the financial goal",
            type: "node",
            params: {},
            labelRange: {
              start: { line: 4, column: 4, offset: 52 },
              end: { line: 4, column: 51, offset: 99 }
            }
          },
          {
            id: "C",
            text: "Ensure people are in a state of optimal performance",
            type: "node",
            params: {},
            labelRange: {
              start: { line: 5, column: 4, offset: 103 },
              end: { line: 5, column: 55, offset: 154 }
            }
          },
          {
            id: "D",
            text: "Subordinate people's needs to the financial goal",
            type: "node",
            params: {},
            labelRange: {
              start: { line: 6, column: 4, offset: 158 },
              end: { line: 6, column: 52, offset: 206 }
            }
          },
          {
            id: "D'",
            text: "Attend to people's needs (& let people work)",
            type: "node",
            params: {},
            labelRange: {
              start: { line: 7, column: 5, offset: 211 },
              end: { line: 7, column: 49, offset: 255 }
            }
          }
        ]
      }
      expect((await parseTextToAst(text)).ast).toStrictEqual(expected)
    })

    it("with only labels, quoted", async () => {
      const text = `
type: conflict
A: "Maximize business performance {"
B: "Subordinate all decisions to the financial goal"
C: "Ensure people are in a state of optimal performance"
D: "Subordinate people's needs to the financial goal"
D': "Attend to people's needs (& let people work)"
      `
      const expected = {
        statements: [
          {
            id: "A",
            text: "Maximize business performance {",
            type: "node",
            params: {},
            labelRange: {
              start: { line: 3, column: 4, offset: 19 },
              end: { line: 3, column: 37, offset: 52 }
            }
          },
          {
            id: "B",
            text: "Subordinate all decisions to the financial goal",
            type: "node",
            params: {},
            labelRange: {
              start: { line: 4, column: 4, offset: 56 },
              end: { line: 4, column: 53, offset: 105 }
            }
          },
          {
            id: "C",
            text: "Ensure people are in a state of optimal performance",
            type: "node",
            params: {},
            labelRange: {
              start: { line: 5, column: 4, offset: 109 },
              end: { line: 5, column: 57, offset: 162 }
            }
          },
          {
            id: "D",
            text: "Subordinate people's needs to the financial goal",
            type: "node",
            params: {},
            labelRange: {
              start: { line: 6, column: 4, offset: 166 },
              end: { line: 6, column: 54, offset: 216 }
            }
          },
          {
            id: "D'",
            text: "Attend to people's needs (& let people work)",
            type: "node",
            params: {},
            labelRange: {
              start: { line: 7, column: 5, offset: 221 },
              end: { line: 7, column: 51, offset: 267 }
            }
          }
        ]
      }
      expect((await parseTextToAst(text)).ast).toStrictEqual(expected)
    })

    it("with injection on requirement", async () => {
      const text = `
type: conflict
A: Maximize business performance
D: Subordinate people's needs to the financial goal
A <- D: inject Psychological flow triggers
      `
      const expected = {
        statements: [
          {
            id: "A",
            text: "Maximize business performance",
            type: "node",
            params: {},
            labelRange: {
              start: { line: 3, column: 4, offset: 19 },
              end: { line: 3, column: 33, offset: 48 }
            }
          },
          {
            id: "D",
            text: "Subordinate people's needs to the financial goal",
            type: "node",
            params: {},
            labelRange: {
              start: { line: 4, column: 4, offset: 52 },
              end: { line: 4, column: 52, offset: 100 }
            }
          },
          {
            fromIds: ["D"],
            toId: "A",
            text: "inject Psychological flow triggers",
            type: "edge"
          }
        ]
      }
      expect((await parseTextToAst(text)).ast).toStrictEqual(expected)
    })

    it("with injection on conflict", async () => {
      const text = `
type: conflict
D -> D': "Discover they don't conflict"
      `
      const expected = {
        statements: [
          {
            type: "edge",
            text: "Discover they don't conflict",
            fromIds: ["D"],
            toId: "D'"
          }
        ]
      }
      expect((await parseTextToAst(text)).ast).toStrictEqual(expected)
    })
    it("can inject with bidirectional edge", async () => {
      const text = `
type: conflict
D -- D': "Discover they don't conflict"
      `
      const expected = {
        statements: [
          {
            type: "edge",
            text: "Discover they don't conflict",
            fromIds: ["D"],
            toId: "D'",
            biDirectional: true
          }
        ]
      }
      expect((await parseTextToAst(text)).ast).toStrictEqual(expected)
    })
    it("single-line comments", async () => {
      const text = `
      # This is a comment
      type: conflict
      `
      const expected = {
        statements: [
          {
            text: " This is a comment",
            type: "comment"
          }
        ]
      }
      expect((await parseTextToAst(text)).ast).toStrictEqual(expected)
    })
  })

  it("parses example", async () => {
    const text = exampleEvaporatingCloudText
    expect((await parseTextToAst(text)).ast).not.toBeNull()
  })
})
