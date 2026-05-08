import { describe, it, expect } from "vitest";
import {
  safeIdx,
  calculateScore,
  getTier,
  calculatePartialScore,
  multiScore,
  getOptionText,
  getMultiOptionTexts,
  calculateROI,
  formatBRL,
} from "../data";

/* ════════════════════════════════════════════════════════════
   safeIdx
   ════════════════════════════════════════════════════════════ */

describe("safeIdx", () => {
  it("returns value at valid index", () => {
    expect(safeIdx([10, 20, 30], 1, 0)).toBe(20);
  });

  it("returns fallback for out-of-bounds index", () => {
    expect(safeIdx([10, 20, 30], 5, 0)).toBe(0);
  });

  it("returns fallback for negative index", () => {
    expect(safeIdx([10, 20, 30], -1, 0)).toBe(0);
  });

  it("works with number fallback", () => {
    expect(safeIdx([1, 2, 3], 10, 99)).toBe(99);
  });

  it("works with string type", () => {
    expect(safeIdx(["a", "b", "c"], 0, "x")).toBe("a");
    expect(safeIdx(["a", "b", "c"], 5, "x")).toBe("x");
  });
});

/* ════════════════════════════════════════════════════════════
   calculateScore
   ════════════════════════════════════════════════════════════ */

describe("calculateScore", () => {
  it("returns 0 for empty answers", () => {
    expect(calculateScore({})).toBe(0);
  });

  it("correctly scores a full answer set", () => {
    const answers: Record<string, number[]> = {
      cargo: [0],       // 10
      tamanho: [4],      // 20
      setor: [5],        // 18
      gargalos: [0, 1, 2, 3, 4], // multiScore(5) = 5
      processos: [4],    // 20
      sistemas: [3],     // 15
      tempo: [3],        // 15
      impactos: [0, 1, 2, 3, 4, 5], // multiScore(6) = 7
      urgencia: [4],     // 10
      budget: [4],       // 15
    };
    // raw = 10+20+18+5+20+15+15+7+10+15 = 135
    // score = min(100, round(135/127*100)) = min(100,106) = 100
    expect(calculateScore(answers)).toBe(100);
  });

  it("urgencia imediata (index 4) guarantees minimum 55 (Tier B)", () => {
    const answers: Record<string, number[]> = {
      urgencia: [4], // 10 pts raw => round(10/127*100) = 8, but floor is 55
    };
    const score = calculateScore(answers);
    expect(score).toBeGreaterThanOrEqual(55);
  });

  it("urgencia + budget alto guarantees minimum 60 (Tier A eligible)", () => {
    const answers: Record<string, number[]> = {
      urgencia: [4],
      budget: [2], // budget >= 2
    };
    const score = calculateScore(answers);
    expect(score).toBeGreaterThanOrEqual(60);
  });

  it("score is capped at 100", () => {
    // All max values
    const answers: Record<string, number[]> = {
      cargo: [0],
      tamanho: [4],
      setor: [5],
      gargalos: [0, 1, 2, 3, 4],
      processos: [4],
      sistemas: [3],
      tempo: [3],
      impactos: [0, 1, 2, 3, 4, 5],
      urgencia: [4],
      budget: [4],
    };
    expect(calculateScore(answers)).toBeLessThanOrEqual(100);
  });

  it("handles out-of-bounds indices gracefully (no NaN)", () => {
    const answers: Record<string, number[]> = {
      cargo: [99],
      tamanho: [99],
      setor: [99],
      processos: [99],
      sistemas: [99],
      tempo: [99],
      urgencia: [99],
      budget: [99],
    };
    const score = calculateScore(answers);
    expect(Number.isNaN(score)).toBe(false);
    expect(typeof score).toBe("number");
    expect(score).toBe(0);
  });
});

/* ════════════════════════════════════════════════════════════
   getTier
   ════════════════════════════════════════════════════════════ */

describe("getTier", () => {
  it("score >= 75 returns Tier A", () => {
    expect(getTier(80).tier).toBe("A");
    expect(getTier(80).label).toBe("Potencial Alto");
  });

  it("score 55-74 returns Tier B", () => {
    expect(getTier(60).tier).toBe("B");
    expect(getTier(60).label).toBe("Potencial Moderado");
  });

  it("score 40-54 returns Tier C", () => {
    expect(getTier(45).tier).toBe("C");
    expect(getTier(45).label).toBe("Potencial Inicial");
  });

  it("score < 40 returns Tier D", () => {
    expect(getTier(20).tier).toBe("D");
    expect(getTier(20).label).toBe("Em Desenvolvimento");
  });

  it("boundary value 75 returns Tier A", () => {
    expect(getTier(75).tier).toBe("A");
  });

  it("boundary value 55 returns Tier B", () => {
    expect(getTier(55).tier).toBe("B");
  });

  it("boundary value 40 returns Tier C", () => {
    expect(getTier(40).tier).toBe("C");
  });

  it("boundary value 39 returns Tier D", () => {
    expect(getTier(39).tier).toBe("D");
  });
});

/* ════════════════════════════════════════════════════════════
   calculatePartialScore
   ════════════════════════════════════════════════════════════ */

describe("calculatePartialScore", () => {
  it("returns 0 for no answered questions", () => {
    expect(calculatePartialScore({})).toBe(0);
  });

  it("partial answers produce lower scores", () => {
    const partial: Record<string, number[]> = {
      cargo: [0], // 10
    };
    const full: Record<string, number[]> = {
      cargo: [0],
      tamanho: [4],
      processos: [4],
      urgencia: [4],
    };
    expect(calculatePartialScore(partial)).toBeLessThan(
      calculatePartialScore(full)
    );
  });

  it("more answers produce higher scores", () => {
    const oneAnswer: Record<string, number[]> = { cargo: [0] };
    const twoAnswers: Record<string, number[]> = {
      cargo: [0],
      tamanho: [4],
    };
    const threeAnswers: Record<string, number[]> = {
      cargo: [0],
      tamanho: [4],
      processos: [4],
    };
    const s1 = calculatePartialScore(oneAnswer);
    const s2 = calculatePartialScore(twoAnswers);
    const s3 = calculatePartialScore(threeAnswers);
    expect(s1).toBeLessThan(s2);
    expect(s2).toBeLessThan(s3);
  });
});

/* ════════════════════════════════════════════════════════════
   multiScore
   ════════════════════════════════════════════════════════════ */

describe("multiScore", () => {
  it("returns 0 for 0", () => {
    expect(multiScore(0)).toBe(0);
  });

  it("returns 1 for 1", () => {
    expect(multiScore(1)).toBe(1);
  });

  it("returns 3 for 2", () => {
    expect(multiScore(2)).toBe(3);
  });

  it("returns 3 for 3", () => {
    expect(multiScore(3)).toBe(3);
  });

  it("returns 5 for 4", () => {
    expect(multiScore(4)).toBe(5);
  });

  it("returns 5 for 5", () => {
    expect(multiScore(5)).toBe(5);
  });

  it("returns 7 for 6+", () => {
    expect(multiScore(6)).toBe(7);
    expect(multiScore(10)).toBe(7);
  });
});

/* ════════════════════════════════════════════════════════════
   getOptionText / getMultiOptionTexts
   ════════════════════════════════════════════════════════════ */

describe("getOptionText", () => {
  it("valid index returns correct text", () => {
    expect(getOptionText("cargo", 0)).toBe("Sócio(a)/Fundador(a)");
    expect(getOptionText("cargo", 4)).toBe("Analista/Operação");
  });

  it("out-of-bounds returns 'Não informado'", () => {
    expect(getOptionText("cargo", 99)).toBe("Não informado");
  });

  it("undefined index returns 'Não informado'", () => {
    expect(getOptionText("cargo", undefined)).toBe("Não informado");
  });

  it("invalid question id returns 'Não informado'", () => {
    expect(getOptionText("nonexistent", 0)).toBe("Não informado");
  });

  it("negative index returns 'Não informado'", () => {
    expect(getOptionText("cargo", -1)).toBe("Não informado");
  });
});

describe("getMultiOptionTexts", () => {
  it("valid indices return correct texts", () => {
    const result = getMultiOptionTexts("gargalos", [0, 2]);
    expect(result).toEqual([
      "Financeiro (fechamentos lentos)",
      "Operação (falhas na transição)",
    ]);
  });

  it("filters out invalid indices", () => {
    const result = getMultiOptionTexts("gargalos", [0, 99, -1, 2]);
    expect(result).toEqual([
      "Financeiro (fechamentos lentos)",
      "Operação (falhas na transição)",
    ]);
  });

  it("undefined returns empty array", () => {
    expect(getMultiOptionTexts("gargalos", undefined)).toEqual([]);
  });

  it("empty array returns empty array", () => {
    expect(getMultiOptionTexts("gargalos", [])).toEqual([]);
  });

  it("invalid question id returns empty array", () => {
    expect(getMultiOptionTexts("nonexistent", [0, 1])).toEqual([]);
  });
});

/* ════════════════════════════════════════════════════════════
   calculateROI
   ════════════════════════════════════════════════════════════ */

describe("calculateROI", () => {
  it("returns null when tempo is missing", () => {
    expect(calculateROI({})).toBeNull();
    expect(calculateROI({ setor: [0] })).toBeNull();
  });

  it("returns correct ROI object with valid inputs", () => {
    const answers: Record<string, number[]> = {
      tempo: [1], // 50 hours/month
      setor: [5], // SaaS/Tecnologia => hourly cost 63
    };
    const roi = calculateROI(answers);
    expect(roi).not.toBeNull();
    expect(roi!.monthlyHours).toBe(50);
    expect(roi!.hourlyCost).toBe(63);
    expect(roi!.monthlyCost).toBe(Math.round(50 * 63 * 0.8)); // 2520
    expect(roi!.annualCost).toBe(roi!.monthlyCost * 12);
  });

  it("different tamanho/setor values produce different costs", () => {
    const varejo = calculateROI({ tempo: [2], setor: [0] }); // Varejo: 32/h
    const saas = calculateROI({ tempo: [2], setor: [5] });   // SaaS: 63/h
    expect(varejo).not.toBeNull();
    expect(saas).not.toBeNull();
    expect(varejo!.monthlyCost).toBeLessThan(saas!.monthlyCost);
  });

  it("defaults to 'Outro' hourly cost when setor is missing", () => {
    const roi = calculateROI({ tempo: [0] });
    expect(roi).not.toBeNull();
    expect(roi!.hourlyCost).toBe(38); // "Outro" default
  });
});

/* ════════════════════════════════════════════════════════════
   formatBRL
   ════════════════════════════════════════════════════════════ */

describe("formatBRL", () => {
  it("formats numbers as BRL currency", () => {
    const result = formatBRL(1500);
    // locale-dependent but should contain R$ and 1.500 or 1,500
    expect(result).toContain("R$");
    expect(result).toContain("1");
    expect(result).toContain("500");
  });

  it("formats zero", () => {
    const result = formatBRL(0);
    expect(result).toContain("R$");
    expect(result).toContain("0");
  });

  it("formats large numbers", () => {
    const result = formatBRL(100000);
    expect(result).toContain("R$");
    expect(result).toContain("100");
  });
});
