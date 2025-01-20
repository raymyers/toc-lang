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
            params: {}
          },
          {
            id: "B",
            text: "Subordinate all decisions to the financial goal",
            type: "node",
            params: {}
          },
          {
            id: "C",
            text: "Ensure people are in a state of optimal performance",
            type: "node",
            params: {}
          },
          {
            id: "D",
            text: "Subordinate people's needs to the financial goal",
            type: "node",
            params: {}
          },
          {
            id: "D'",
            text: "Attend to people's needs (& let people work)",
            type: "node",
            params: {}
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
            params: {}
          },
          {
            id: "B",
            text: "Subordinate all decisions to the financial goal",
            type: "node",
            params: {}
          },
          {
            id: "C",
            text: "Ensure people are in a state of optimal performance",
            type: "node",
            params: {}
          },
          {
            id: "D",
            text: "Subordinate people's needs to the financial goal",
            type: "node",
            params: {}
          },
          {
            id: "D'",
            text: "Attend to people's needs (& let people work)",
            type: "node",
            params: {}
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
            params: {}
          },
          {
            id: "D",
            text: "Subordinate people's needs to the financial goal",
            type: "node",
            params: {}
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
