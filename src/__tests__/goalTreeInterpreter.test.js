import { describe, expect, it } from "vitest"
import { parseTextToAst, parseGoalTreeSemantics, Node } from "../interpreter"
import { exampleGoalTreeText } from "../examples"

describe("goal tree interpreter", () => {
  describe("parses ast for input", () => {
    it("with only goal", async () => {
      const text = `
      type: goal
      goal: "win"
      `
      const expected = {
        statements: [
          {
            text: "win",
            type: "node",
            id: "Goal",
            params: {},
            labelRange: {
              start: { line: 3, column: 13, offset: 30 },
              end: { line: 3, column: 18, offset: 35 }
            }
          }
        ]
      }
      expect((await parseTextToAst(text)).ast).toStrictEqual(expected)
    })

    it("with CSF and NCs", async () => {
      const text = `
      type: goal

      Goal: win

      weScore: We score points { class: CSF }
      theyDont: Other team doesn't score { class: CSF }

      possession: We get the ball
      shooting: We shoot the ball accurately
      defense: We have good defense

      theyDont <- defense
      weScore <- possession 
      weScore <- shooting
      `
      const expected = {
        statements: [
          {
            id: "Goal",
            text: "win",
            type: "node",
            params: {},
            labelRange: {
              start: { line: 4, column: 13, offset: 31 },
              end: { line: 4, column: 16, offset: 34 }
            }
          },
          {
            id: "weScore",
            text: "We score points",
            type: "node",
            params: { class: "CSF" },
            labelRange: {
              start: { line: 6, column: 16, offset: 51 },
              end: { line: 6, column: 32, offset: 67 }
            }
          },
          {
            id: "theyDont",
            text: "Other team doesn't score",
            type: "node",
            params: { class: "CSF" },
            labelRange: {
              start: { line: 7, column: 17, offset: 98 },
              end: { line: 7, column: 42, offset: 123 }
            }
          },
          {
            id: "possession",
            text: "We get the ball",
            type: "node",
            params: {},
            labelRange: {
              start: { line: 9, column: 19, offset: 157 },
              end: { line: 9, column: 34, offset: 172 }
            }
          },
          {
            id: "shooting",
            text: "We shoot the ball accurately",
            type: "node",
            params: {},
            labelRange: {
              start: { line: 10, column: 17, offset: 189 },
              end: { line: 10, column: 45, offset: 217 }
            }
          },
          {
            id: "defense",
            text: "We have good defense",
            type: "node",
            params: {},
            labelRange: {
              start: { line: 11, column: 16, offset: 233 },
              end: { line: 11, column: 36, offset: 253 }
            }
          },
          {
            toId: "theyDont",
            fromIds: ["defense"],
            type: "edge",
            text: undefined
          },
          {
            toId: "weScore",
            fromIds: ["possession"],
            type: "edge",
            text: undefined
          },
          {
            toId: "weScore",
            fromIds: ["shooting"],
            type: "edge",
            text: undefined
          }
        ]
      }
      expect((await parseTextToAst(text)).ast).toStrictEqual(expected)
    })
    it("node status", async () => {
      const text = `
        type: goal
        mynode: "win" {
          status: 50
        }
      `
      const expected = {
        statements: [
          {
            text: "win",
            type: "node",
            id: "mynode",
            params: { status: 50 },
            labelRange: {
              start: { line: 3, column: 17, offset: 36 },
              end: { line: 3, column: 22, offset: 41 }
            }
          }
        ]
      }
      expect((await parseTextToAst(text)).ast).toStrictEqual(expected)
    })
    it("single-line comments", async () => {
      const text = `
      # This is a comment
      type: goal
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
    const text = exampleGoalTreeText
    const { ast } = await parseTextToAst(text)
    expect(ast).not.toBeNull()
    const semTree = parseGoalTreeSemantics(ast)
    const expectedSemTree = {
      edges: [
        {
          from: "revUp",
          to: "Goal"
        },
        {
          from: "costsDown",
          to: "Goal"
        },
        {
          from: "features",
          to: "newCust"
        },
        {
          from: "retain",
          to: "features"
        },
        {
          from: "newCust",
          to: "revUp"
        },
        {
          from: "keepCust",
          to: "revUp"
        },
        {
          from: "reduceInfra",
          to: "costsDown"
        },
        {
          from: "marketSalary",
          to: "retain"
        },
        {
          from: "morale",
          to: "retain"
        }
      ],
      nodes: new Map(
        Object.entries({
          Goal: {
            annotation: "G",
            key: "Goal",
            label: "Make money now and in the future",
            labelRange: {
              start: { line: 3, column: 7, offset: 18 },
              end: { line: 3, column: 41, offset: 52 }
            }
          },
          revUp: {
            annotation: "CSF",
            key: "revUp",
            label: "Generate more revenue",
            labelRange: {
              start: { line: 5, column: 8, offset: 61 },
              end: { line: 5, column: 31, offset: 84 }
            }
          },
          costsDown: {
            annotation: "CSF",
            key: "costsDown",
            label: "Control costs",
            labelRange: {
              start: { line: 8, column: 12, offset: 115 },
              end: { line: 8, column: 27, offset: 130 }
            }
          },
          keepCust: {
            key: "keepCust",
            label: "Protect relationship with existing customers",
            labelRange: {
              start: { line: 15, column: 11, offset: 194 },
              end: { line: 15, column: 57, offset: 240 }
            }
          },
          newCust: {
            key: "newCust",
            label: "Acquire new customers",
            labelRange: {
              start: { line: 16, column: 10, offset: 250 },
              end: { line: 16, column: 33, offset: 273 }
            }
          },
          reduceInfra: {
            key: "reduceInfra",
            label: "Reduce infrastructure spending",
            labelRange: {
              start: { line: 18, column: 14, offset: 288 },
              end: { line: 18, column: 46, offset: 320 }
            }
          },
          retain: {
            key: "retain",
            label: "Retain employees",
            labelRange: {
              start: { line: 19, column: 9, offset: 329 },
              end: { line: 19, column: 27, offset: 347 }
            }
          },
          marketSalary: {
            key: "marketSalary",
            label: "Keep up with market salaries",
            labelRange: {
              start: { line: 20, column: 15, offset: 362 },
              end: { line: 20, column: 45, offset: 392 }
            }
          },
          morale: {
            key: "morale",
            label: "Maintain employee morale",
            labelRange: {
              start: { line: 22, column: 9, offset: 402 },
              end: { line: 22, column: 35, offset: 428 }
            }
          },
          features: {
            key: "features",
            label: "Develop new features",
            labelRange: {
              start: { line: 23, column: 11, offset: 439 },
              end: { line: 23, column: 33, offset: 461 }
            }
          }
        })
      ),
      rankdir: "BT"
    }
    expect(semTree).toStrictEqual(expectedSemTree)
  })
})
