import { describe, expect, it } from "vitest";
import { wrapLines } from "../util";


describe("util", () => {
    it("wrap lines", async () => {
      const text = 'Subordinate all decisions to the financial goal';
      const expected = [
        'Subordinate all ',
        'decisions to the ',
        'financial goal '
      ];
      expect(wrapLines(text, 20)).toStrictEqual(expected);
    });
});