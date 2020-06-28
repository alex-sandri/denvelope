import { setup, teardown } from "../helpers";

describe("User document read/write", () =>
{
	afterEach(async () => teardown());

	test("Fail read/write when not the owner", async () =>
	{
		const db = await setup({ uid: "test" });

		const ref = db.collection("users").doc("test1");

		expect(ref.get()).toDeny();
		expect(ref.set({})).toDeny();
		expect(ref.update({})).toDeny();
		expect(ref.delete()).toDeny();
	});

	test("Succeed read and fail write when the owner", async () =>
	{
		const db = await setup({ uid: "test" });

		const ref = db.collection("users").doc("test");

		expect(ref.get()).toAllow();
		expect(ref.set({})).toDeny();
		expect(ref.update({})).toDeny();
		expect(ref.delete()).toDeny();
	});
});