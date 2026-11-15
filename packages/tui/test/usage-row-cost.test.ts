import { beforeAll, describe, expect, it } from "bun:test";
import type { Usage } from "@oh-my-pi/pi-ai";
import { createUsageRowBlock, formatUsageRow } from "@oh-my-pi/pi-tui/overlays/usage-row";
import { initTheme } from "@oh-my-pi/pi-tui/theme";

const cx = { cols: 100, reduceMotion: false, dark: true, supports: () => true, feature: () => true };

function requestUsage(total: number): Usage {
	return {
		input: 4242,
		output: 7,
		cacheRead: 0,
		cacheWrite: 0,
		totalTokens: 4249,
		cost: { input: total, output: 0, cacheRead: 0, cacheWrite: 0, total },
	};
}

beforeAll(async () => {
	await initTheme(false);
});

describe("per-request usage cost", () => {
	it("shows the billed cost of one request at per-call precision", () => {
		expect(formatUsageRow(requestUsage(0.0012345))).toContain("$0.0012");
	});

	it("omits the cost when the request was not billed", () => {
		expect(formatUsageRow(requestUsage(0))).not.toContain("$");
	});

	it("bounds costs below the displayed precision", () => {
		expect(formatUsageRow(requestUsage(0.00001))).toContain("<$0.0001");
	});

	it("carries the cost into the native usage row", () => {
		const node = createUsageRowBlock(requestUsage(0.5)).describe(cx);
		expect(JSON.stringify(node)).toContain("$0.5000");
	});
});
