const firebase = require("@firebase/testing");
const { setup, teardown, mockData, newFolderValidMockData, newFolderInvalidMockData, unlockedVaultMockData, lockedVaultMockData } = require("../helpers");

describe("OWNER:TRUE", () =>
{
    afterEach(async () => await teardown());

    test("ALLOW:READ", async () =>
    {
        const db = await setup({ uid: "test" }, mockData);

        const ref = db.collection("users/test/folders").doc("folderId");

        await expect(ref.get()).toAllow();
    });

    test("ALLOW:CREATE", async () =>
    {
        const db = await setup({ uid: "test" }, mockData);

        const ref = db.collection("users/test/folders");

        await expect(ref.add(newFolderValidMockData)).toAllow();
    });

    test("ALLOW:UPDATE", async () =>
    {
        const db = await setup({ uid: "test" }, { ...mockData, ...unlockedVaultMockData });

        const ref = db.collection("users/test/folders").doc("folderId");

        await expect(ref.update({
            name: "testName",
            updated: firebase.firestore.FieldValue.serverTimestamp(),
            lastClientUpdateTime: firebase.firestore.FieldValue.serverTimestamp()
        })).toAllow();

        await expect(ref.update({
            parentId: "anotherFolderId",
            updated: firebase.firestore.FieldValue.serverTimestamp(),
            lastClientUpdateTime: firebase.firestore.FieldValue.serverTimestamp()
        })).toAllow();

        await expect(ref.update({
            parentId: "vault",
            inVault: true,
            updated: firebase.firestore.FieldValue.serverTimestamp(),
            lastClientUpdateTime: firebase.firestore.FieldValue.serverTimestamp()
        })).toAllow();
    });

    test("ALLOW:DELETE", async () =>
    {
        const db = await setup({ uid: "test" }, mockData);

        const trashedFolderRef = db.collection("users/test/folders").doc("trashedFolder");
        const inVaultFolderRef = db.collection("users/test/folders").doc("inVaultFolder");

        await expect(trashedFolderRef.delete()).toAllow();
        await expect(inVaultFolderRef.delete()).toAllow();
    });

    test("DENY:READ", async () =>
    {
        const db = await setup({ uid: "test" }, { ...mockData, ...lockedVaultMockData });

        const ref = db.collection("users/test/folders").doc("inVaultFolder");

        await expect(ref.get()).toDeny();
    });

    test("DENY:CREATE", async () =>
    {
        const db = await setup({ uid: "test" }, mockData);

        const ref = db.collection("users/test/folders");

        await expect(ref.add(newFolderInvalidMockData)).toDeny();
    });

    describe("DENY:UPDATE", () =>
    {
        test("GENERIC", async () =>
        {
            const db = await setup({ uid: "test" }, mockData);

            const ref = db.collection("users/test/folders").doc("folderId");

            await expect(ref.update({
                parentId: "nonExistentFolderId",
                updated: firebase.firestore.FieldValue.serverTimestamp(),
                lastClientUpdateTime: firebase.firestore.FieldValue.serverTimestamp()
            })).toDeny();

            await expect(ref.update({
                updated: firebase.firestore.FieldValue.serverTimestamp(),
                lastClientUpdateTime: new firebase.firestore.Timestamp.fromDate(new Date("1/1/1970"))
            })).toDeny();

            await expect(ref.update({
                parentId: "folderId",
                updated: firebase.firestore.FieldValue.serverTimestamp(),
                lastClientUpdateTime: firebase.firestore.FieldValue.serverTimestamp()
            })).toDeny();
        });

        test("VAULT:LOCKED", async () =>
        {
            const db = await setup({ uid: "test" }, { ...mockData, ...lockedVaultMockData});

            const ref = db.collection("users/test/folders").doc("folderId");

            await expect(ref.update({
                parentId: "vault",
                inVault: true,
                updated: firebase.firestore.FieldValue.serverTimestamp(),
                lastClientUpdateTime: firebase.firestore.FieldValue.serverTimestamp()
            })).toDeny();
        });

        test("VAULT:UNLOCKED", async () =>
        {
            const db = await setup({ uid: "test" }, { ...mockData, ...unlockedVaultMockData});

            const ref = db.collection("users/test/folders").doc("inVaultFolder");

            await expect(ref.update({
                trashed: false,
                updated: firebase.firestore.FieldValue.serverTimestamp(),
                lastClientUpdateTime: firebase.firestore.FieldValue.serverTimestamp()
            })).toDeny();

            await expect(ref.update({
                parentId: "root",
                updated: firebase.firestore.FieldValue.serverTimestamp(),
                lastClientUpdateTime: firebase.firestore.FieldValue.serverTimestamp()
            })).toDeny();

            await expect(ref.update({
                inVault: false,
                updated: firebase.firestore.FieldValue.serverTimestamp(),
                lastClientUpdateTime: firebase.firestore.FieldValue.serverTimestamp()
            })).toDeny();
        });
    });

    test("DENY:DELETE", async () =>
    {
        const db = await setup({ uid: "test" }, mockData);

        const ref = db.collection("users/test/folders").doc("folderId");

        await expect(ref.delete()).toDeny();
    });
});