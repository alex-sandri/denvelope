import { setup, teardown } from "../helpers";

describe("Non-existent collection read/write", () =>
{
	let db: firebase.firestore.Firestore;
	let ref: firebase.firestore.CollectionReference;

	beforeAll(async () =>
	{
		db = await setup();

		ref = db.collection("non-existent-collection");
	});

	afterAll(async () => await teardown());

	test("Fail when reading/writing a non-existent collection", async () =>
	{
		await expect(ref.get()).toDeny();
	});
});