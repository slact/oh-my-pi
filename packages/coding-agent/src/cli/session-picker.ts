import { ProcessTerminal, TUI } from "@oh-my-pi/pi-tui";
import { HookSelectorComponent } from "../modes/components/hook-selector";
import { SessionSelectorComponent } from "../modes/components/session-selector";
import type { SessionInfo } from "../session/session-manager";
import { FileSessionStorage } from "../session/session-storage";

/** Show TUI session selector and return selected session path or null if cancelled */
export async function selectSession(sessions: SessionInfo[]): Promise<string | null> {
	const { promise, resolve } = Promise.withResolvers<string | null>();
	const ui = new TUI(new ProcessTerminal());
	let resolved = false;
	const storage = new FileSessionStorage();

	const showSelector = () => {
		const selector = new SessionSelectorComponent(
			sessions,
			(path: string) => {
				if (!resolved) {
					resolved = true;
					ui.stop();
					resolve(path);
				}
			},
			() => {
				if (!resolved) {
					resolved = true;
					ui.stop();
					resolve(null);
				}
			},
			() => {
				if (!resolved) {
					resolved = true;
					ui.stop();
					process.exit(0);
				}
			},
			(session: SessionInfo) => {
				// Show confirmation dialog using HookSelectorComponent (standard pattern)
				const displayName = session.title || session.firstMessage.slice(0, 40) || session.id;
				const confirm = new HookSelectorComponent(
					`Delete session?\n${displayName}`,
					["Yes", "No"],
					async (option: string) => {
					if (option === "Yes") {
						// Confirmed - delete the session
					await storage.deleteSessionWithArtifacts(session.path);
						selector.getSessionList().removeSession(session.path);
					}
						// Return to selector either way
						ui.removeChild(confirm);
						ui.addChild(selector);
						ui.setFocus(selector.getSessionList());
						ui.requestRender();
					},
					() => {
						// Cancelled - return to selector
						ui.removeChild(confirm);
						ui.addChild(selector);
						ui.setFocus(selector.getSessionList());
						ui.requestRender();
					},
				);
				ui.removeChild(selector);
				ui.addChild(confirm);
				ui.setFocus(confirm);
			},
		);
		return selector;
	};

	const selector = showSelector();
	ui.addChild(selector);
	ui.setFocus(selector.getSessionList());
	ui.start();
	return promise;
}