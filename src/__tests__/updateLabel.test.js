import { describe, expect, it } from "vitest"
import { updateLabel } from "../interpreter"

describe("updateLabel functionality", () => {
  describe("goal tree", () => {
    it("updates goal node label", async () => {
      const sourceText = `type: goal
Goal: win the game
player1: score points`

      const result = await updateLabel(sourceText, "Goal", "achieve victory")

      expect(result).toBe(`type: goal
Goal: "achieve victory"
player1: score points`)
    })

    it("updates regular node label", async () => {
      const sourceText = `type: goal
Goal: win the game
player1: score points
player2: defend well`

      const result = await updateLabel(sourceText, "player1", "get high score")

      expect(result).toBe(`type: goal
Goal: win the game
player1: "get high score"
player2: defend well`)
    })

    it("preserves parameters when updating label", async () => {
      const sourceText = `type: goal
Goal: win the game
player1: score points { status: 75 }
player2: defend well`

      const result = await updateLabel(sourceText, "player1", "get high score")

      expect(result).toBe(`type: goal
Goal: win the game
player1: "get high score" { status: 75 }
player2: defend well`)
    })
  })

  describe("problem tree", () => {
    it("updates problem node label", async () => {
      const sourceText = `type: problem
UDE1: System is slow { class: UDE }
cause1: Database queries are inefficient`

      const result = await updateLabel(sourceText, "UDE1", "Application performance is poor")

      expect(result).toBe(`type: problem
UDE1: "Application performance is poor" { class: UDE }
cause1: Database queries are inefficient`)
    })

    it("updates cause node label", async () => {
      const sourceText = `type: problem
UDE1: System is slow { class: UDE }
cause1: Database queries are inefficient`

      const result = await updateLabel(sourceText, "cause1", "SQL queries lack proper indexing")

      expect(result).toBe(`type: problem
UDE1: System is slow { class: UDE }
cause1: "SQL queries lack proper indexing"`)
    })
  })

  describe("conflict diagram", () => {
    it("updates cloud node label", async () => {
      const sourceText = `type: conflict
A: Maximize business performance
B: Subordinate all decisions to the financial goal
C: Ensure people are in a state of optimal performance`

      const result = await updateLabel(sourceText, "A", "Optimize company results")

      expect(result).toBe(`type: conflict
A: "Optimize company results"
B: Subordinate all decisions to the financial goal
C: Ensure people are in a state of optimal performance`)
    })

    it("updates multiple nodes correctly", async () => {
      const sourceText = `type: conflict
A: Maximize business performance
B: Subordinate all decisions to the financial goal
C: Ensure people are in a state of optimal performance`

      let result = await updateLabel(sourceText, "A", "Optimize company results")
      result = await updateLabel(result, "B", "Prioritize financial metrics")

      expect(result).toBe(`type: conflict
A: "Optimize company results"
B: "Prioritize financial metrics"
C: Ensure people are in a state of optimal performance`)
    })
  })

  describe("edge cases", () => {
    it("returns original text when node not found", async () => {
      const sourceText = `type: goal
Goal: win the game
player1: score points`

      const result = await updateLabel(sourceText, "nonexistent", "new label")

      expect(result).toBe(sourceText)
    })

    it("handles nodes with complex parameters", async () => {
      const sourceText = `type: goal
Goal: win the game
player1: score points { status: 75, class: "important" }
player2: defend well`

      const result = await updateLabel(sourceText, "player1", "achieve high score")

      expect(result).toBe(`type: goal
Goal: win the game
player1: "achieve high score" { status: 75, class: "important" }
player2: defend well`)
    })

    it("handles labels with special characters", async () => {
      const sourceText = `type: goal
Goal: win the game
player1: score points`

      const result = await updateLabel(sourceText, "player1", "score 100+ points & win!")

      expect(result).toBe(`type: goal
Goal: win the game
player1: "score 100+ points & win!"`)
    })

    it("handles whitespace variations", async () => {
      const sourceText = `type: goal
Goal:    win the game
player1:score points
player2 : defend well`

      const result = await updateLabel(sourceText, "Goal", "achieve victory")

      expect(result).toBe(`type: goal
Goal:    "achieve victory"
player1:score points
player2 : defend well`)
    })

    it("handles labels with quotes by escaping them", async () => {
      const sourceText = `type: goal
Goal: win the game
player1: score points`

      const result = await updateLabel(sourceText, "player1", 'achieve "high score" today')

      expect(result).toBe(`type: goal
Goal: win the game
player1: "achieve \\"high score\\" today"`)
    })

    it("handles labels with multiple quotes", async () => {
      const sourceText = `type: conflict
A: Maximize business performance
B: Subordinate all decisions to the financial goal`

      const result = await updateLabel(sourceText, "A", 'Optimize "company" results and "performance"')

      expect(result).toBe(`type: conflict
A: "Optimize \\"company\\" results and \\"performance\\""
B: Subordinate all decisions to the financial goal`)
    })

    it("handles empty quotes in labels", async () => {
      const sourceText = `type: goal
Goal: win the game
player1: score points`

      const result = await updateLabel(sourceText, "player1", 'achieve "" score')

      expect(result).toBe(`type: goal
Goal: win the game
player1: "achieve \\"\\" score"`)
    })

    it("preserves parameter blocks without deleting braces", async () => {
      const sourceText = `type: goal
Goal: win the game
costsDown: "Control costs" { class: CSF }
player1: score points`

      const result = await updateLabel(sourceText, "costsDown", "Reduce expenses")

      expect(result).toBe(`type: goal
Goal: win the game
costsDown: "Reduce expenses" { class: CSF }
player1: score points`)
    })

    it("handles the exact reported brace deletion bug case", async () => {
      const sourceText = `type: goal

costsDown: "Control costs" { class: CSF }`

      const result = await updateLabel(sourceText, "costsDown", "Reduce expenses")

      expect(result).toBe(`type: goal

costsDown: "Reduce expenses" { class: CSF }`)

      // Verify the brace is preserved
      expect(result).toContain("Reduce expenses")
      expect(result).toContain("{")
      expect(result).toContain("class: CSF")
      expect(result).toContain("}")
    })
  })
})
