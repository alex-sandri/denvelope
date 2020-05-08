const firebase = require("@firebase/testing");
const { setup, teardown } = require("../helpers");

const data = {
    "users/test/folders/folderId": {
        name: "folder",
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
        name: "folder1",
        parentId: "root",
        shared: false,
        starred: false,
        trashed: false,
        inVault: false,
        created: firebase.firestore.FieldValue.serverTimestamp(),
        updated: firebase.firestore.FieldValue.serverTimestamp(),
        lastClientUpdateTime: firebase.firestore.FieldValue.serverTimestamp()
    },
    "users/test/files/fileId": {
        name: "file",
        parentId: "root",
        size: 42,
        shared: false,
        starred: false,
        trashed: false,
        inVault: false,
        created: firebase.firestore.FieldValue.serverTimestamp(),
        updated: firebase.firestore.FieldValue.serverTimestamp(),
        lastClientUpdateTime: firebase.firestore.FieldValue.serverTimestamp()
    },
    "users/test/files/anotherFileId": {
        name: "file1",
        parentId: "root",
        size: 0,
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

    test("COLLECTION:FOLDERS|FILES;ALLOW:READ;OWNER:TRUE", async () =>
    {
        const db = await setup({ uid: "test" }, data);

        const folderRef = db.collection("users/test/folders").doc("folderId");
        const fileRef = db.collection("users/test/files").doc("fileId");

        await expect(folderRef.get()).toAllow();
        await expect(fileRef.get()).toAllow();
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
    });

    test("COLLECTION:FOLDERS|FILES;DENY:READ;OWNER:FALSE", async () =>
    {
        const db = await setup({ uid: "test" }, data);

        const folderRef = db.collection("users/test1/folders").doc("folderId");
        const fileRef = db.collection("users/tes1/files").doc("fileId");

        await expect(folderRef.get()).toDeny();
        await expect(fileRef.get()).toDeny();
    });

    test("COLLECTION:FOLDERS;DENY:UPDATE;OWNER:TRUE", async () =>
    {
        const db = await setup({ uid: "test" }, data);

        const ref = db.collection("users/test/folders").doc("folderId");

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

    test("COLLECTION:FILES;DENY:UPDATE;OWNER:TRUE", async () =>
    {
        const db = await setup({ uid: "test" }, data);

        const ref = db.collection("users/test/folders").doc("fileId");

        await expect(ref.update({
            parentId: "nonExistentFolderId",
            updated: firebase.firestore.FieldValue.serverTimestamp(),
            lastClientUpdateTime: firebase.firestore.FieldValue.serverTimestamp()
        })).toDeny();

        await expect(ref.update({
            size: 0,
            updated: firebase.firestore.FieldValue.serverTimestamp(),
            lastClientUpdateTime: new firebase.firestore.Timestamp.fromDate(new Date("1/1/1970"))
        })).toDeny();
    });

    test("COLLECTION:FILES;DENY:UPDATE;OWNER:FALSE", async () =>
    {
        const db = await setup({ uid: "test1" }, data);

        const ref = db.collection("users/test/folders").doc("fileId");

        await expect(ref.update({
            parentId: "nonExistentFolderId",
            updated: firebase.firestore.FieldValue.serverTimestamp(),
            lastClientUpdateTime: firebase.firestore.FieldValue.serverTimestamp()
        })).toDeny();

        await expect(ref.update({
            size: 0,
            updated: firebase.firestore.FieldValue.serverTimestamp(),
            lastClientUpdateTime: firebase.firestore.FieldValue.serverTimestamp()
        })).toDeny();

        await expect(ref.update({
            updated: firebase.firestore.FieldValue.serverTimestamp(),
            lastClientUpdateTime: new firebase.firestore.Timestamp.fromDate(new Date("1/1/1970"))
        })).toDeny();
    });
});