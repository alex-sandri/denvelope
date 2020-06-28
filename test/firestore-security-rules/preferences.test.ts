import { setup, teardown } from "../helpers";

import { Config } from "../../src/ts/config/Config";

const PREFERENCES_PATH = "users/test/config/preferences";

const mockData = {
	initial: { [PREFERENCES_PATH]: { language: Config.Locales[0] } },
	valid: [
		{ language: Config.Locales[1] },
		{ backgroundImageUrl: "https://example.com/image.jpg" },
		{
			dateFormatOptions: {
				year: "numeric",
				month: "numeric",
				day: "numeric",
				hour: "numeric",
				minute: "numeric",
			},
		},
	],
	invalid: [
		{ language: "" }, // Cannot be empty
		{ language: "en-US" }, // Must be in lower case
		{ backgroundImageUrl: "" }, // Cannot be empty
		{ backgroundImageUrl: "http://example.com/image.jpg" }, // Must be HTTPS
		{ backgroundImageUrl: "file:///C:/image.jpg" }, // Protocol must be https
		{
			// Required fields are: [ year, month, day, hour, minute ]
			dateFormatOptions: {
				year: "numeric",
				month: "numeric",
				day: "numeric",
				hour: "numeric",
			},
		},
		{
			dateFormatOptions: {
				year: "numeric",
				month: "numeric",
				day: "numeric",
				hour: "numeric",
				minute: "other", // Valid values are: [ numeric, 2-digit ]
			},
		},
	],
};

describe("OWNER:TRUE", () =>
{
	afterEach(async () => await teardown());

	describe("READ", () =>
	{
		test("ALLOW", async () =>
		{
			const db = await setup({ uid: "test" }, mockData.initial);

			await expect(db.doc(PREFERENCES_PATH).get()).toAllow();
		});
	});

	describe("WRITE", () =>
	{
		test("ALLOW", async () =>
		{
			const db = await setup({ uid: "test" });

			for (const data of mockData.valid) await expect(db.doc(PREFERENCES_PATH).set(data)).toAllow();
		});

		test("DENY", async () =>
		{
			const db = await setup({ uid: "test" });

			for (const data of mockData.invalid)
				await expect(db.doc(PREFERENCES_PATH).set(data)).toDeny();
		});
	});

	describe("DELETE", () =>
	{
		test("DENY", async () =>
		{
			const db = await setup({ uid: "test" }, mockData.initial);

			await expect(db.doc(PREFERENCES_PATH).delete()).toDeny();
		});
	});
});