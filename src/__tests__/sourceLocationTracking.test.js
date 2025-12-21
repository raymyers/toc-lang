import { describe, expect, it } from "vitest"
import {
  parseTextToAst,
  parseGoalTreeSemantics,
  parseProblemTreeSemantics
} from "../interpreter"

describe("source location tracking", () => {
  describe("goal tree", () => {
    it("tracks label range for goal node", async () => {
      const text = `type: goal
Goal: win the game`
      const result = await parseTextToAst(text)
      const semantics = parseGoalTreeSemantics(result.ast)

      const goalNode = semantics.nodes.get("Goal")
      expect(goalNode).toBeDefined()
      expect(goalNode.labelRange).toBeDefined()
      expect(goalNode.labelRange.start).toMatchObject({
        line: expect.any(Number),
        column: expect.any(Number),
        offset: expect.any(Number)
      })
      expect(goalNode.labelRange.end).toMatchObject({
        line: expect.any(Number),
        column: expect.any(Number),
        offset: expect.any(Number)
      })
    })

    it("tracks label range for regular nodes", async () => {
      const text = `type: goal
Goal: win the game
player1: score points
player2: defend well`
      const result = await parseTextToAst(text)
      const semantics = parseGoalTreeSemantics(result.ast)

      const player1Node = semantics.nodes.get("player1")
      expect(player1Node).toBeDefined()
      expect(player1Node.labelRange).toBeDefined()
      expect(player1Node.label).toBe("score points")

      const player2Node = semantics.nodes.get("player2")
      expect(player2Node).toBeDefined()
      expect(player2Node.labelRange).toBeDefined()
      expect(player2Node.label).toBe("defend well")
    })
  })

  describe("problem tree", () => {
    it("tracks label range for problem nodes", async () => {
      const text = `type: problem
UDE1: System is slow { class: UDE }
cause1: Database queries are inefficient`
      const result = await parseTextToAst(text)
      const semantics = parseProblemTreeSemantics(result.ast)

      const udeNode = semantics.nodes.get("UDE1")
      expect(udeNode).toBeDefined()
      expect(udeNode.labelRange).toBeDefined()
      expect(udeNode.label).toBe("System is slow")

      const causeNode = semantics.nodes.get("cause1")
      expect(causeNode).toBeDefined()
      expect(causeNode.labelRange).toBeDefined()
      expect(causeNode.label).toBe("Database queries are inefficient")
    })
  })

  describe("conflict diagram", () => {
    it("tracks label range for cloud nodes", async () => {
      const text = `type: conflict
A: Maximize business performance
B: Subordinate all decisions to the financial goal
C: Ensure people are in a state of optimal performance`
      const result = await parseTextToAst(text)

      const nodeA = result.ast.statements.find((s) => s.id === "A")
      expect(nodeA).toBeDefined()
      expect(nodeA.labelRange).toBeDefined()
      expect(nodeA.text).toBe("Maximize business performance")

      const nodeB = result.ast.statements.find((s) => s.id === "B")
      expect(nodeB).toBeDefined()
      expect(nodeB.labelRange).toBeDefined()
      expect(nodeB.text).toBe("Subordinate all decisions to the financial goal")
    })
  })

  describe("source location accuracy", () => {
    it("provides accurate line and column numbers", async () => {
      const text = `type: goal
Goal: win the game
player1: score points`
      const result = await parseTextToAst(text)
      const semantics = parseGoalTreeSemantics(result.ast)

      const goalNode = semantics.nodes.get("Goal")
      expect(goalNode.labelRange.start.line).toBe(2) // Second line
      expect(goalNode.labelRange.start.column).toBeGreaterThan(5) // After "Goal: "

      const player1Node = semantics.nodes.get("player1")
      expect(player1Node.labelRange.start.line).toBe(3) // Third line
      expect(player1Node.labelRange.start.column).toBeGreaterThan(8) // After "player1: "
    })
  })
})
