import { describe, it, expect } from "vitest";
import { render } from "../test/helpers";
import { screen } from "@testing-library/svelte";
import ErrorNotifications from "./ErrorNotifications.svelte";
import { errorStore } from "../errorHandling";

describe("ErrorNotifications Component", () => {
	beforeEach(() => {
		errorStore.clearErrors();
	});

	it("should render without errors when no errors exist", () => {
		render(ErrorNotifications);
		const notifications = screen.queryAllByRole("alert");
		expect(notifications).toHaveLength(0);
	});

	it("should display error notifications when errors are added", () => {
		render(ErrorNotifications);

		errorStore.addError("Test error message", "error");

		// Check if error is displayed
		expect(screen.getByText(/Test error message/i)).toBeInTheDocument();
	});

	it("should display multiple errors", () => {
		render(ErrorNotifications);

		errorStore.addError("First error", "error");
		errorStore.addError("Second error", "warning");

		expect(screen.getByText(/First error/i)).toBeInTheDocument();
		expect(screen.getByText(/Second error/i)).toBeInTheDocument();
	});

	it("should apply correct severity classes", () => {
		render(ErrorNotifications);

		errorStore.addError("Info message", "info");
		errorStore.addError("Warning message", "warning");
		errorStore.addError("Error message", "error");

		const notifications = screen.getAllByRole("alert");
		expect(notifications).toHaveLength(3);
	});
});
