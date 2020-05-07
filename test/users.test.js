const { setup, teardown } = require("./helpers");

describe("User document read/write", () =>
{
    afterEach(async () => await teardown());

    test("Fail when not the owner", async () =>
    {
        const db = await setup({ uid: "test" });

        const ref = db.collection("users").doc("test1");

        await expect(ref.get()).toDeny();
        await expect(ref.update({})).toDeny();
    });

    test("Succeed when the owner", async () =>
    {
        const db = await setup({ uid: "test" });

        const ref = db.collection("users").doc("test");

        await expect(ref.get()).toAllow();
        await expect(ref.update({})).toDeny();
    });
});