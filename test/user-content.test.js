const firebase = require("@firebase/testing");
const { setup, teardown } = require("./helpers");

describe("User content rules", () =>
{
    afterEach(async () => await teardown());

    /**
     * USER IS OWNER
     */

    test("Allow read", async () =>
    {
        const db = await setup({ uid: "test" });

        const ref = db.collection("users/test/folders").doc("folderId");

        await expect(ref.get()).toAllow();
    });

    test("Update", async () =>
    {
        const data = {
            "users/test/folders/folderId": {
                name: "test",
                parentId: "root",
                shared: false,
                starred: false,
                trashed: false,
                inVault: false,
                created: firebase.firestore.FieldValue.serverTimestamp(),
                updated: firebase.firestore.FieldValue.serverTimestamp(),
                lastClientUpdateTime: firebase.firestore.FieldValue.serverTimestamp()
            },
            "users/test/folders/anotherFolderId": {
                name: "test1",
                parentId: "root",
                shared: false,
                starred: false,
                trashed: false,
                inVault: false,
                created: firebase.firestore.FieldValue.serverTimestamp(),
                updated: firebase.firestore.FieldValue.serverTimestamp(),
                lastClientUpdateTime: firebase.firestore.FieldValue.serverTimestamp()
            }
        }

        const db = await setup({ uid: "test" }, data);

        const ref = db.collection("users/test/folders").doc("folderId");

        await expect(ref.update({
            name: "testName",
            updated: firebase.firestore.FieldValue.serverTimestamp(),
            lastClientUpdateTime: firebase.firestore.FieldValue.serverTimestamp()
        })).toAllow();

        await expect(db.collection("users/test/folders").doc("anotherFolderId").update({
            parentId: "folderId",
            updated: firebase.firestore.FieldValue.serverTimestamp(),
            lastClientUpdateTime: firebase.firestore.FieldValue.serverTimestamp()
        })).toAllow();

        await expect(ref.update({
            parentId: "nonExistentFolderId",
            updated: firebase.firestore.FieldValue.serverTimestamp(),
            lastClientUpdateTime: firebase.firestore.FieldValue.serverTimestamp()
        })).toDeny();
    });

    /**
     * USER IS NOT THE OWNER
     */

    test("Deny read", async () =>
    {
        const db = await setup({ uid: "test" });

        const ref = db.collection("users/test1/folders").doc("folderId");

        await expect(ref.get()).toDeny();
    });
});