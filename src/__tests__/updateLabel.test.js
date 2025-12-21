import { describe, expect, it } from "vitest"
import { updateLabel } from "../interpreter"

describe("updateLabel functionality", () => {
  describe("goal tree", () => {
    it("updates goal node label", () => {
      const sourceText = `type: goal
Goal: win the game
player1: score points`
      
      const result = updateLabel(sourceText, "Goal", "achieve victory")
      
      expect(result).toBe(`type: goal
Goal: "achieve victory"
player1: score points`)
    })

    it("updates regular node label", () => {
      const sourceText = `type: goal
Goal: win the game
player1: score points
player2: defend well`
      
      const result = updateLabel(sourceText, "player1", "get high score")
      
      expect(result).toBe(`type: goal
Goal: win the game
player1: "get high score"
player2: defend well`)
    })

    it("preserves parameters when updating label", () => {
      const sourceText = `type: goal
Goal: win the game
player1: score points { status: 75 }
player2: defend well`
      
      const result = updateLabel(sourceText, "player1", "get high score")
      
      expect(result).toBe(`type: goal
Goal: win the game
player1: "get high score" { status: 75 }
player2: defend well`)
    })
  })

  describe("problem tree", () => {
    it("updates problem node label", () => {
      const sourceText = `type: problem
UDE1: System is slow { class: UDE }
cause1: Database queries are inefficient`
      
      const result = updateLabel(sourceText, "UDE1", "Application performance is poor")
      
      expect(result).toBe(`type: problem
UDE1: "Application performance is poor" { class: UDE }
cause1: Database queries are inefficient`)
    })

    it("updates cause node label", () => {
      const sourceText = `type: problem
UDE1: System is slow { class: UDE }
cause1: Database queries are inefficient`
      
      const result = updateLabel(sourceText, "cause1", "SQL queries lack proper indexing")
      
      expect(result).toBe(`type: problem
UDE1: System is slow { class: UDE }
cause1: "SQL queries lack proper indexing"`)
    })
  })

  describe("conflict diagram", () => {
    it("updates cloud node label", () => {
      const sourceText = `type: conflict
A: Maximize business performance
B: Subordinate all decisions to the financial goal
C: Ensure people are in a state of optimal performance`
      
      const result = updateLabel(sourceText, "A", "Optimize company results")
      
      expect(result).toBe(`type: conflict
A: "Optimize company results"
B: Subordinate all decisions to the financial goal
C: Ensure people are in a state of optimal performance`)
    })

    it("updates multiple nodes correctly", () => {
      const sourceText = `type: conflict
A: Maximize business performance
B: Subordinate all decisions to the financial goal
C: Ensure people are in a state of optimal performance`
      
      let result = updateLabel(sourceText, "A", "Optimize company results")
      result = updateLabel(result, "B", "Prioritize financial metrics")
      
      expect(result).toBe(`type: conflict
A: "Optimize company results"
B: "Prioritize financial metrics"
C: Ensure people are in a state of optimal performance`)
    })
  })

  describe("edge cases", () => {
    it("returns original text when node not found", () => {
      const sourceText = `type: goal
Goal: win the game
player1: score points`
      
      const result = updateLabel(sourceText, "nonexistent", "new label")
      
      expect(result).toBe(sourceText)
    })

    it("handles nodes with complex parameters", () => {
      const sourceText = `type: goal
Goal: win the game
player1: score points { status: 75, class: "important" }
player2: defend well`
      
      const result = updateLabel(sourceText, "player1", "achieve high score")
      
      expect(result).toBe(`type: goal
Goal: win the game
player1: "achieve high score" { status: 75, class: "important" }
player2: defend well`)
    })

    it("handles labels with special characters", () => {
      const sourceText = `type: goal
Goal: win the game
player1: score points`
      
      const result = updateLabel(sourceText, "player1", "score 100+ points & win!")
      
      expect(result).toBe(`type: goal
Goal: win the game
player1: "score 100+ points & win!"`)
    })

    it("handles whitespace variations", () => {
      const sourceText = `type: goal
Goal:    win the game
player1:score points
player2 : defend well`
      
      const result = updateLabel(sourceText, "Goal", "achieve victory")
      
      expect(result).toBe(`type: goal
Goal: "achieve victory"
player1:score points
player2 : defend well`)
    })

    it("handles labels with quotes by escaping them", () => {
      const sourceText = `type: goal
Goal: win the game
player1: score points`
      
      const result = updateLabel(sourceText, "player1", 'achieve "high score" today')
      
      expect(result).toBe(`type: goal
Goal: win the game
player1: "achieve \\"high score\\" today"`)
    })

    it("handles labels with multiple quotes", () => {
      const sourceText = `type: conflict
A: Maximize business performance
B: Subordinate all decisions to the financial goal`
      
      const result = updateLabel(sourceText, "A", 'Optimize "company" results and "performance"')
      
      expect(result).toBe(`type: conflict
A: "Optimize \\"company\\" results and \\"performance\\""
B: Subordinate all decisions to the financial goal`)
    })

    it("handles empty quotes in labels", () => {
      const sourceText = `type: goal
Goal: win the game
player1: score points`
      
      const result = updateLabel(sourceText, "player1", 'achieve "" score')
      
      expect(result).toBe(`type: goal
Goal: win the game
player1: "achieve \\"\\" score"`)
    })
  })
})