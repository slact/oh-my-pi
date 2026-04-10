import { enrichModelThinking } from "./model-thinking";
import MODELS from "./models.json" with { type: "json" };
import type { Api, KnownProvider, Model, Usage } from "./types";

/**
 * Static bundled model registry loaded from `models.json`.
 *
 * This module intentionally exposes compile-time defaults only.
 * It does not include runtime discovery, models.dev overlays, or on-disk cache state.
 *
 * For runtime-aware resolution, use `createModelManager()` / `resolveProviderModels()`.
 */
const modelRegistry: Map<string, Map<string, Model<Api>>> = new Map();
for (const [provider, models] of Object.entries(MODELS)) {
	const providerModels = new Map<string, Model<Api>>();
	for (const [id, model] of Object.entries(models)) {
		providerModels.set(id, enrichModelThinking(model as Model<Api>));
	}
	modelRegistry.set(provider, providerModels);
}

export type GeneratedProvider = keyof typeof MODELS;

export function getBundledModel<TApi extends Api = Api>(provider: GeneratedProvider, modelId: string): Model<TApi> {
	const providerModels = modelRegistry.get(provider);
	return providerModels?.get(modelId) as Model<TApi>;
}

export function getBundledProviders(): KnownProvider[] {
	return Array.from(modelRegistry.keys()) as KnownProvider[];
}

export function getBundledModels(provider: GeneratedProvider): Model<Api>[] {
	const models = modelRegistry.get(provider);
	return models ? (Array.from(models.values()) as Model<Api>[]) : [];
}
export function calculateCost<TApi extends Api>(model: Model<TApi>, usage: Usage): Usage["cost"] {
<<<<<<< HEAD
	usage.cost.input = (model.cost.input / 1000000) * usage.input;
	usage.cost.output = (model.cost.output / 1000000) * usage.output;
	usage.cost.cacheRead = (model.cost.cacheRead / 1000000) * usage.cacheRead;
	usage.cost.cacheWrite = (model.cost.cacheWrite / 1000000) * usage.cacheWrite;
	usage.cost.total = usage.cost.input + usage.cost.output + usage.cost.cacheRead + usage.cost.cacheWrite;
||||||| parent of f6e951de7 (detail cost per api request (and fix cached-tokens display))
	// If OpenRouter actual cost is present, use it as the total
	if (usage.actualCost !== undefined) {
		usage.cost.total = usage.actualCost;
		// Populate breakdown from costDetails if available
		const d = usage.costDetails;
		if (d) {
			if (d.upstreamInferenceInputCost !== undefined) usage.cost.input = d.upstreamInferenceInputCost;
			if (d.upstreamInferenceOutputCost !== undefined) usage.cost.output = d.upstreamInferenceOutputCost;
			// upstreamInferenceCost is not directly mapped; may represent combined input+output
		}
		// Fill any remaining zero breakdown fields with estimated values based on token counts
		if (usage.cost.input === 0) usage.cost.input = (model.cost.input / 1_000_000) * usage.input;
		if (usage.cost.output === 0) usage.cost.output = (model.cost.output / 1_000_000) * usage.output;
		if (usage.cost.cacheRead === 0) usage.cost.cacheRead = (model.cost.cacheRead / 1_000_000) * usage.cacheRead;
		if (usage.cost.cacheWrite === 0) usage.cost.cacheWrite = (model.cost.cacheWrite / 1_000_000) * usage.cacheWrite;
		return usage.cost;
	}

	// No actual cost: estimate from token counts and model pricing
	usage.cost.input = (model.cost.input / 1_000_000) * usage.input;
	usage.cost.output = (model.cost.output / 1_000_000) * usage.output;
	usage.cost.cacheRead = (model.cost.cacheRead / 1_000_000) * usage.cacheRead;
	usage.cost.cacheWrite = (model.cost.cacheWrite / 1_000_000) * usage.cacheWrite;
	usage.cost.total = usage.cost.input + usage.cost.output + usage.cost.cacheRead + usage.cost.cacheWrite;
=======
	// Always compute OMP's token-based estimate
	const input = (model.cost.input / 1_000_000) * usage.input;
	const output = (model.cost.output / 1_000_000) * usage.output;
	const cacheRead = (model.cost.cacheRead / 1_000_000) * usage.cacheRead;
	const cacheWrite = (model.cost.cacheWrite / 1_000_000) * usage.cacheWrite;
	const estimate: { input: number; output: number; cacheRead: number; cacheWrite: number; total: number } = {
		input,
		output,
		cacheRead,
		cacheWrite,
		total: input + output + cacheRead + cacheWrite,
	};

	// Store estimate so callers can compare actual vs estimate
	usage.cost.estimate = estimate;

	// Fill in undefined fields with estimate values (preserve actual values from provider)
	if (usage.cost.input === undefined) usage.cost.input = estimate.input;
	if (usage.cost.output === undefined) usage.cost.output = estimate.output;
	if (usage.cost.cacheRead === undefined) usage.cost.cacheRead = estimate.cacheRead;
	if (usage.cost.cacheWrite === undefined) usage.cost.cacheWrite = estimate.cacheWrite;
	if (usage.cost.total === undefined) usage.cost.total = estimate.total;

>>>>>>> f6e951de7 (detail cost per api request (and fix cached-tokens display))
	return usage.cost;
}
/**
 * Check if two models are equal by comparing both their id and provider.
 * Returns false if either model is null or undefined.
 */
export function modelsAreEqual<TApi extends Api>(
	a: Model<TApi> | null | undefined,
	b: Model<TApi> | null | undefined,
): boolean {
	if (!a || !b) return false;
	return a.id === b.id && a.provider === b.provider;
}
