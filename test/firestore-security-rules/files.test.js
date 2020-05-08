const firebase = require("@firebase/testing");
const { setup, teardown, mockData, newFileValidMockData, newFileInvalidMockData, unlockedVaultMockData, lockedVaultMockData } = require("../helpers");

describe("OWNER:TRUE", () =>
{
    afterEach(async () => await teardown());

    describe("READ", () =>
    {
        describe("ALLOW", () =>
        {
            test("GENERIC", async () =>
            {
                const db = await setup({ uid: "test" }, mockData);
        
                const ref = db.collection("users/test/files").doc("fileId");
        
                await expect(ref.get()).toAllow();
            });
        });

        describe("DENY", () =>
        {
            test("VAULT:LOCKED", async () =>
            {
                const db = await setup({ uid: "test" }, { ...mockData, ...lockedVaultMockData });

                const ref = db.collection("users/test/files").doc("inVaultFile");

                await expect(ref.get()).toDeny();
            });
        });
    });

    describe("CREATE", () =>
    {
        describe("ALLOW", () =>
        {
            test("GENERIC", async () =>
            {
                const db = await setup({ uid: "test" }, mockData);

                const ref = db.collection("users/test/files");

                await expect(ref.add(newFileValidMockData)).toAllow();
            });
        });

        describe("DENY", () =>
        {
            test("GENERIC", async () =>
            {
                const db = await setup({ uid: "test" }, mockData);

                const ref = db.collection("users/test/files");

                await expect(ref.add(newFileInvalidMockData)).toDeny();
            });
        });
    });
    
    describe("UPDATE", () =>
    {
        describe("ALLOW", () =>
        {
            test("GENERIC", async () =>
            {
                const db = await setup({ uid: "test" }, mockData);

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
            });

            test("VAULT:UNLOCKED", async () =>
            {
                const db = await setup({ uid: "test" }, { ...mockData, ...unlockedVaultMockData });

                const ref = db.collection("users/test/files").doc("fileId");

                await expect(ref.update({
                    parentId: "vault",
                    inVault: true,
                    updated: firebase.firestore.FieldValue.serverTimestamp(),
                    lastClientUpdateTime: firebase.firestore.FieldValue.serverTimestamp()
                })).toAllow();
            });
        });

        describe("DENY", () =>
        {
            test("GENERIC", async () =>
            {
                const db = await setup({ uid: "test" }, mockData);

                const ref = db.collection("users/test/files").doc("fileId");

                await expect(ref.update({
                    parentId: "nonExistentFolderId",
                    updated: firebase.firestore.FieldValue.serverTimestamp(),
                    lastClientUpdateTime: firebase.firestore.FieldValue.serverTimestamp()
                })).toDeny();

                await expect(ref.update({
                    updated: firebase.firestore.FieldValue.serverTimestamp(),
                    lastClientUpdateTime: new firebase.firestore.Timestamp.fromDate(new Date("1/1/1970"))
                })).toDeny();
            });

            test("VAULT:LOCKED", async () =>
            {
                const db = await setup({ uid: "test" }, { ...mockData, ...lockedVaultMockData});

                const ref = db.collection("users/test/files").doc("fileId");

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
                    trashed: true,
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
    });

    describe("DELETE", () =>
    {
        describe("ALLOW", () =>
        {
            test("GENERIC", async () =>
            {
                const db = await setup({ uid: "test" }, mockData);
    
                const ref = db.collection("users/test/files").doc("trashedFile");
    
                await expect(ref.delete()).toAllow();
            });
    
            test("VAULT:UNLOCKED", async () =>
            {
                const db = await setup({ uid: "test" }, { ...mockData, ...unlockedVaultMockData });
    
                const ref = db.collection("users/test/files").doc("inVaultFile");
    
                await expect(ref.delete()).toAllow();
            });
        });

        describe("DENY", () =>
        {
            test("GENERIC", async () =>
            {
                const db = await setup({ uid: "test" }, mockData);
        
                const ref = db.collection("users/test/files").doc("fileId");
        
                await expect(ref.delete()).toDeny();
            });

            test("VAULT:LOCKED", async () =>
            {
                const db = await setup({ uid: "test" }, { ...mockData, ...lockedVaultMockData });
    
                const ref = db.collection("users/test/files").doc("inVaultFile");
    
                await expect(ref.delete()).toDeny();
            });
        });
    });
});