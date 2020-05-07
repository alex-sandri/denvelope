const firebase = require("@firebase/testing");
const { setup, teardown } = require("../helpers");

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

describe("USER_CONTENT", () =>
{
    afterEach(async () => await teardown());

    test("COLLECTION:FOLDERS;ALLOW:READ;OWNER:TRUE", async () =>
    {
        const db = await setup({ uid: "test" }, data);

        const ref = db.collection("users/test/folders").doc("folderId");

        await expect(ref.get()).toAllow();
    });

    test("COLLECTION:FOLDERS;ALLOW:UPDATE;OWNER:TRUE", async () =>
    {
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

        await expect(ref.update({
            parentId: "folderId",
            updated: firebase.firestore.FieldValue.serverTimestamp(),
            lastClientUpdateTime: new firebase.firestore.Timestamp.fromDate(new Date("1/1/1970"))
        })).toDeny();
    });

    test("COLLECTION:FOLDERS;DENY:READ;OWNER:FALSE", async () =>
    {
        const db = await setup({ uid: "test" }, data);

        const ref = db.collection("users/test1/folders").doc("folderId");

        await expect(ref.get()).toDeny();
    });
});