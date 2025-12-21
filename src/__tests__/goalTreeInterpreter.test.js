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
            params: {}
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
              end: { line: 6, column: 31, offset: 66 }
            }
          },
          {
            id: "theyDont",
            text: "Other team doesn't score",
            type: "node",
            params: { class: "CSF" },
            labelRange: {
              start: { line: 7, column: 17, offset: 98 },
              end: { line: 7, column: 41, offset: 122 }
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
            params: { status: 50 }
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
            label: "Make money now and in the future"
          },
          revUp: {
            annotation: "CSF",
            key: "revUp",
            label: "Generate more revenue"
          },
          costsDown: {
            annotation: "CSF",
            key: "costsDown",
            label: "Control costs"
          },
          keepCust: {
            key: "keepCust",
            label: "Protect relationship with existing customers"
          },
          newCust: {
            key: "newCust",
            label: "Acquire new customers"
          },
          reduceInfra: {
            key: "reduceInfra",
            label: "Reduce infrastructure spending"
          },
          retain: {
            key: "retain",
            label: "Retain employees"
          },
          marketSalary: {
            key: "marketSalary",
            label: "Keep up with market salaries"
          },
          morale: {
            key: "morale",
            label: "Maintain employee morale"
          },
          features: {
            key: "features",
            label: "Develop new features"
          }
        })
      ),
      rankdir: "BT"
    }
    expect(semTree).toStrictEqual(expectedSemTree)
  })
})
