import { afterEach, describe, expect, it, vi } from "bun:test";
import { ToolExecutionComponent } from "@oh-my-pi/pi-coding-agent/modes/components/tool-execution";
import { initTheme } from "@oh-my-pi/pi-coding-agent/modes/theme/theme";
import type { TUI } from "@oh-my-pi/pi-tui";

describe("ToolExecutionComponent activity cadence", () => {
	let initialized = false;

	afterEach(() => {
		vi.useRealTimers();
		vi.restoreAllMocks();
	});

	async function makeComponent(activityIntervalMs: number, requestRender = vi.fn(), requestComponentRender = vi.fn()) {
		if (!initialized) {
			await initTheme();
			initialized = true;
		}
		const uiStub = {
			requestRender,
			requestComponentRender,
			getActivityIntervalMs: () => activityIntervalMs,
		} as unknown as TUI;
		return {
			component: new ToolExecutionComponent("hub", { poll: ["j0"] }, {}, undefined, uiStub),
			requestRender,
			requestComponentRender,
		};
	}

	it("uses the TUI activity cadence for waiting job poll spinners", async () => {
		vi.useFakeTimers();
		const { component, requestComponentRender } = await makeComponent(100);

		component.updateResult(
			{
				content: [{ type: "text", text: "" }],
				details: {
					jobs: [{ id: "j0", type: "task", status: "running", label: "job 0", durationMs: 1_000 }],
				},
			},
			false,
		);
		expect(requestComponentRender).not.toHaveBeenCalled();

		vi.advanceTimersByTime(99);
		expect(requestComponentRender).not.toHaveBeenCalled();

		vi.advanceTimersByTime(1);
		expect(requestComponentRender).toHaveBeenCalledTimes(1);

		component.stopAnimation();
	});
});
