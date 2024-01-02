import { describe, expect, it } from "vitest"
import { parseTextToAst, parseProblemTreeSemantics } from "../interpreter"
import approvals from "approvals"
import { exampleProblemTreeText } from "../examples"
const testCases = [
  {
    name: "with only UDE",
    text: "b: badness {class: UDE}"
  },
  {
    name: "with only UDE quoted label",
    text: 'b: "badness" {class: UDE}'
  },
  {
    name: "with UDE and single cause",
    text: `
    b: "badness" {class: UDE}
    c: "cause"
    b <- c
    `
  },
  {
    name: "with UDE and multi-cause",
    text: `
    b: "badness" {class: UDE}
    c1: "cause 1"
    c2: "cause 2"
    b <- c1 && c2
    `
  },
  {
    name: "with multi-cause right arrow",
    text: `
    b: "badness"
    c1: "cause 1"
    c2: "cause 2"
    c1 && c2 -> b
    `
  },
  {
    name: "single-line comments",
    text: `
    # This is a comment
    `
  },
  {
    name: "single cause right arrow",
    text: `
    b: "badness"
    c: "cause"
    c -> b
    `
  }
]

describe("problem tree interpreter", () => {
  describe("parses ast for input", () => {
    testCases.forEach((testCase) => {
      it(testCase.name, async () => {
        const ast = await parseTextToAst("problem-tree", testCase.text)
        approvals.verifyAsJSON(
          __dirname,
          "parses ast for input " + testCase.name,
          ast
        )
      })
    })

    it("fails for cause referencing unknown node", async () => {
      const text = `
      b: "badness" {class: UDE}
      c: "cause"
      d <- c
      `
      const expected = {
        statements: [
          { text: "badness", type: "node", id: "b", params: { class: "UDE" } },
          { text: "cause", type: "node", id: "c", params: {} },
          { fromIds: ["c"], type: "edge", toId: "d", text: undefined }
        ]
      }
      const ast = await parseTextToAst("problem-tree", text)
      expect(ast).toStrictEqual(expected)
      expect(() => parseProblemTreeSemantics(ast)).toThrowError()
    })

    it("example parses", async () => {
      const text = exampleProblemTreeText
      const ast = await parseTextToAst("problem-tree", text)
      const semantics = parseProblemTreeSemantics(ast)
      const nodes = Object.fromEntries(semantics.nodes)
      approvals.verifyAsJSON(__dirname, "example problem tree", {
        ast,
        semantics: { edges: semantics.edges, nodes }
      })
    })
  })
})
