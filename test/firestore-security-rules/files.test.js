const firebase = require("@firebase/testing");
const { setup, teardown, mockData, newFileValidMockData, newFileInvalidMockData, unlockedVaultMockData, lockedVaultMockData } = require("../helpers");

describe("OWNER:TRUE", () =>
{
    afterEach(async () => await teardown());

    test("ALLOW:READ", async () =>
    {
        const db = await setup({ uid: "test" }, mockData);

        const ref = db.collection("users/test/files").doc("fileId");

        await expect(ref.get()).toAllow();
    });

    test("ALLOW:CREATE", async () =>
    {
        const db = await setup({ uid: "test" }, mockData);

        const ref = db.collection("users/test/files");

        await expect(ref.add(newFileValidMockData)).toAllow();
    });

    test("ALLOW:UPDATE", async () =>
    {
        const db = await setup({ uid: "test" }, { ...mockData, ...unlockedVaultMockData });

        const ref = db.collection("users/test/files").doc("fileId");

        await expect(ref.update({
            name: "testName",
            updated: firebase.firestore.FieldValue.serverTimestamp(),
            lastClientUpdateTime: firebase.firestore.FieldValue.serverTimestamp()
        })).toAllow();

        await expect(ref.update({
            parentId: "folderId",
            updated: firebase.firestore.FieldValue.serverTimestamp(),
            lastClientUpdateTime: firebase.firestore.FieldValue.serverTimestamp()
        })).toAllow();

        await expect(ref.update({
            inVault: true,
            updated: firebase.firestore.FieldValue.serverTimestamp(),
            lastClientUpdateTime: firebase.firestore.FieldValue.serverTimestamp()
        })).toAllow();
    });

    test("ALLOW:DELETE", async () =>
    {
        const db = await setup({ uid: "test" }, mockData);

        const trashedFileRef = db.collection("users/test/files").doc("trashedFile");
        const inVaultFileRef = db.collection("users/test/files").doc("inVaultFile");

        await expect(trashedFileRef.delete()).toAllow();
        await expect(inVaultFileRef.delete()).toAllow();
    });

    test("DENY:READ", async () =>
    {
        const db = await setup({ uid: "test" }, { ...mockData, ...lockedVaultMockData });

        const ref = db.collection("users/test/files").doc("inVaultFile");

        await expect(ref.get()).toDeny();
    });

    test("DENY:CREATE", async () =>
    {
        const db = await setup({ uid: "test" }, mockData);

        const ref = db.collection("users/test/files");

        await expect(ref.add(newFileInvalidMockData)).toDeny();
    });

    test("DENY:UPDATE", async () =>
    {
        const db = await setup({ uid: "test" }, { ...mockData, ...lockedVaultMockData});

        const ref = db.collection("users/test/files").doc("fileId");

        await expect(ref.update({
            size: 0,
            updated: firebase.firestore.FieldValue.serverTimestamp(),
            lastClientUpdateTime: firebase.firestore.FieldValue.serverTimestamp()
        })).toDeny();

        await expect(ref.update({
            parentId: "nonExistentFolderId",
            updated: firebase.firestore.FieldValue.serverTimestamp(),
            lastClientUpdateTime: firebase.firestore.FieldValue.serverTimestamp()
        })).toDeny();

        await expect(ref.update({
            inVault: true,
            updated: firebase.firestore.FieldValue.serverTimestamp(),
            lastClientUpdateTime: firebase.firestore.FieldValue.serverTimestamp()
        })).toDeny();

        await expect(ref.update({
            updated: firebase.firestore.FieldValue.serverTimestamp(),
            lastClientUpdateTime: new firebase.firestore.Timestamp.fromDate(new Date("1/1/1970"))
        })).toDeny();
    });

    test("DENY:DELETE", async () =>
    {
        const db = await setup({ uid: "test" }, mockData);

        const ref = db.collection("users/test/files").doc("fileId");

        await expect(ref.delete()).toDeny();
    });
});