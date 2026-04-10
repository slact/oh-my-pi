import { describe, it, expect } from "bun:test";
import { calculateCost } from "../src/models";
import type { Model, Usage } from "../src/types";

// Minimal mock model with pricing
const mockModel: Model<"openai-completions"> = {
	id: "test-model",
	name: "Test Model",
	api: "openai-completions",
	provider: "openrouter",
	baseUrl: "https://openrouter.ai/api/v1",
	reasoning: false,
	input: ["text"],
	cost: { input: 0.5, output: 1.5, cacheRead: 0, cacheWrite: 0 },
	contextWindow: 4096,
	maxTokens: 4096,
};

describe("calculateCost", () => {
	it("preserves actual total cost from OpenRouter (including 0 for BYOK)", () => {
		const usage: Usage = {
			input: 1000,
			output: 2000,
			cacheRead: 0,
			cacheWrite: 0,
			totalTokens: 3000,
			cost: { total: 0, isByok: true },
		};

		calculateCost(mockModel, usage);

		// Actual cost of 0 is preserved (BYOK)
		expect(usage.cost.total).toBe(0);
		expect(usage.cost.isByok).toBe(true);
		// Individual breakdown fields filled with estimate since not provided
		expect(usage.cost.input).toBeCloseTo(0.0005, 6);
		expect(usage.cost.output).toBeCloseTo(0.003, 6);
		expect(usage.cost.cacheRead).toBeCloseTo(0, 6);
		expect(usage.cost.cacheWrite).toBeCloseTo(0, 6);
		// Estimate always available for comparison
		expect(usage.cost.estimate).toBeDefined();
		expect(usage.cost.estimate!.total).toBeCloseTo(0.0035, 6);
	});

	it("uses full estimate when no actual cost from OpenRouter", () => {
		const usage: Usage = {
			input: 1000,
			output: 2000,
			cacheRead: 0,
			cacheWrite: 0,
			totalTokens: 3000,
			cost: {},
		};

		calculateCost(mockModel, usage);

		// All fields filled with estimate when undefined
		expect(usage.cost.input).toBeCloseTo(0.0005, 6);
		expect(usage.cost.output).toBeCloseTo(0.003, 6);
		expect(usage.cost.cacheRead).toBeCloseTo(0, 6);
		expect(usage.cost.cacheWrite).toBeCloseTo(0, 6);
		expect(usage.cost.total).toBeCloseTo(0.0035, 6);
		expect(usage.cost.estimate).toBeDefined();
		expect(usage.cost.estimate!.total).toBeCloseTo(0.0035, 6);
	});

	it("preserves actual costs and fills only undefined fields with estimate", () => {
		const usage: Usage = {
			input: 1000,
			output: 2000,
			cacheRead: 0,
			cacheWrite: 0,
			totalTokens: 3000,
			cost: { total: 3.75, input: 0.2, output: 3.0 },
		};

		calculateCost(mockModel, usage);

		// Actual costs preserved
		expect(usage.cost.total).toBe(3.75);
		expect(usage.cost.input).toBe(0.2);
		expect(usage.cost.output).toBe(3.0);
		// Undefined fields filled with estimate
		expect(usage.cost.cacheRead).toBeCloseTo(0, 6);
		expect(usage.cost.cacheWrite).toBeCloseTo(0, 6);
		// Estimate always computed for comparison
		expect(usage.cost.estimate).toBeDefined();
		expect(usage.cost.estimate!.total).toBeCloseTo(0.0035, 6);
	});
});
