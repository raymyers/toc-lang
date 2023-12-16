import { describe, expect, it } from "vitest"
import {
  parseTextToAst,
  checkGoalTreeSemantics,
  parseGoalTreeSemantics,
  Node
} from "../interpreter"
import { exampleGoalTreeText } from "../examples"

describe("goal tree interpreter", () => {
  describe("parses ast for input", () => {
    it("with only goal", async () => {
      const text = 'goal: "win"'
      const expected = {
        goal: {
          text: "win",
          type: "node",
          nodeType: "goal",
          id: "goal",
          params: {}
        },
        statements: [
          {
            text: "win",
            type: "node",
            nodeType: "goal",
            id: "goal",
            params: {}
          }
        ]
      }
      expect(await parseTextToAst("goal-tree", text)).toStrictEqual(expected)
    })

    it("with CSF and NCs", async () => {
      const text = `
      Goal: win

      CSF_weScore: We score points
      CSF_theyDont: Other team doesn't score

      possession: We get the ball
      shooting: We shoot the ball accurately
      defense: We have good defense

      CSF_theyDont <- defense
      CSF_weScore <- possession 
      CSF_weScore <- shooting
      `
      const expected = {
        goal: {
          id: "Goal",
          text: "win",
          type: "node",
          nodeType: "goal",
          params: {}
        },
        statements: [
          {
            id: "Goal",
            text: "win",
            type: "node",
            nodeType: "goal",
            params: {}
          },
          {
            id: "CSF_weScore",
            text: "We score points",
            type: "node",
            nodeType: "csf",
            params: {}
          },
          {
            id: "CSF_theyDont",
            text: "Other team doesn't score",
            type: "node",
            nodeType: "csf",
            params: {}
          },
          {
            id: "possession",
            text: "We get the ball",
            type: "node",
            nodeType: "nc",
            params: {}
          },
          {
            id: "shooting",
            text: "We shoot the ball accurately",
            type: "node",
            nodeType: "nc",
            params: {}
          },
          {
            id: "defense",
            text: "We have good defense",
            type: "node",
            nodeType: "nc",
            params: {}
          },
          {
            toId: "CSF_theyDont",
            fromId: "defense",
            type: "edge"
          },
          {
            toId: "CSF_weScore",
            fromId: "possession",
            type: "edge"
          },
          {
            toId: "CSF_weScore",
            fromId: "shooting",
            type: "edge"
          }
        ]
      }
      expect(await parseTextToAst("goal-tree", text)).toStrictEqual(expected)
    })
    it("node status", async () => {
      const text = `
        mynode: "win" {
          status: 50
        }
      `
      const expected = {
        goal: null,
        statements: [
          {
            text: "win",
            type: "node",
            nodeType: "nc",
            id: "mynode",
            params: { status: 50 }
          }
        ]
      }
      expect(await parseTextToAst("goal-tree", text)).toStrictEqual(expected)
    })
    it("single-line comments", async () => {
      const text = `
      # This is a comment
      `
      const expected = {
        goal: null,
        statements: [
          {
            text: " This is a comment",
            type: "comment"
          }
        ]
      }
      expect(await parseTextToAst("goal-tree", text)).toStrictEqual(expected)
    })
  })
  it("parses example", async () => {
    const text = exampleGoalTreeText
    const ast = await parseTextToAst("goal-tree", text)
    expect(ast).not.toBeNull()
    checkGoalTreeSemantics(ast)
    const semTree = parseGoalTreeSemantics(ast)
    const expectedSemTree = {
      edges: [
        {
          from: "CSF_revUp",
          to: "goal"
        },
        {
          from: "CSF_costsDown",
          to: "goal"
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
          to: "CSF_revUp"
        },
        {
          from: "keepCust",
          to: "CSF_revUp"
        },
        {
          from: "reduceInfra",
          to: "CSF_costsDown"
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
          goal: {
            annotation: "G",
            key: "goal",
            label: "Make money now and in the future"
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
          },
          CSF_revUp: {
            annotation: "CSF",
            key: "CSF_revUp",
            label: "Generate more revenue"
          },
          CSF_costsDown: {
            annotation: "CSF",
            key: "CSF_costsDown",
            label: "Control costs"
          }
        })
      ),
      rankdir: "BT"
    }
    expect(semTree).toStrictEqual(expectedSemTree)
  })
})
