import { setup, teardown } from "../helpers";

describe("Vault rules", () =>
{
    afterEach(async () => await teardown());

    test("Fail read/write to vault config when not the owner", async () =>
    {
        const db = await setup({ uid: "test" });

        const ref = db.collection("users/test1/vault").doc("config");

        expect(ref.get()).toDeny();
        expect(ref.set({})).toDeny();
        expect(ref.update({})).toDeny();
        expect(ref.delete()).toDeny();
    });

    test("Fail read/write to vault config when the owner", async () =>
    {
        const db = await setup({ uid: "test" });

        const ref = db.collection("users/test/vault").doc("config");

        expect(ref.get()).toDeny();
        expect(ref.set({})).toDeny();
        expect(ref.update({})).toDeny();
        expect(ref.delete()).toDeny();
    });

    test("Fail read/write to vault status when not the owner", async () =>
    {
        const db = await setup({ uid: "test" });

        const ref = db.collection("users/test1/vault").doc("status");

        expect(ref.get()).toDeny();
        expect(ref.set({})).toDeny();
        expect(ref.update({})).toDeny();
        expect(ref.delete()).toDeny();
    });

    test("Succeed read and fail write to vault status when the owner", async () =>
    {
        const db = await setup({ uid: "test" });

        const ref = db.collection("users/test/vault").doc("status");

        expect(ref.get()).toAllow();
        expect(ref.set({})).toDeny();
        expect(ref.update({})).toDeny();
        expect(ref.delete()).toDeny();
    });
});