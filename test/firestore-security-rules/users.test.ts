import { setup, teardown } from "../helpers";

describe("User document read/write", () =>
{
    afterEach(async () => await teardown());

    test("Fail read/write when not the owner", async () =>
    {
        const db = await setup({ uid: "test" });

        const ref = db.collection("users").doc("test1");

        await expect(ref.get()).toDeny();
        await expect(ref.set({})).toDeny();
        await expect(ref.update({})).toDeny();
        await expect(ref.delete()).toDeny();
    });

    test("Succeed read and fail write when the owner", async () =>
    {
        const db = await setup({ uid: "test" });

        const ref = db.collection("users").doc("test");

        await expect(ref.get()).toAllow();
        await expect(ref.set({})).toDeny();
        await expect(ref.update({})).toDeny();
        await expect(ref.delete()).toDeny();
    });
});