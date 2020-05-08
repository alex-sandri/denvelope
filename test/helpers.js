const firebase = require("@firebase/testing");
const fs = require("fs");

module.exports.setup = async (auth, data) =>
{
    const projectId = `rules-test-${Date.now()}`;

    const app = await firebase.initializeTestApp({ projectId, auth });

    const db = app.firestore();

    await firebase.loadFirestoreRules({ projectId, rules: fs.readFileSync("firestore-no.rules", "utf8") });

    if (data)
        for (const key in data)
            await db.doc(key).set(data[key]);

    await firebase.loadFirestoreRules({ projectId, rules: fs.readFileSync("firestore.rules", "utf8") });

    return db;
}

module.exports.teardown = async () => Promise.all(firebase.apps().map(app => app.delete()));

module.exports.mockData = {
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
    "users/test/folders/trashedFolder": {
        name: "trashedFolder",
        parentId: "root",
        shared: false,
        starred: false,
        trashed: true,
        inVault: false,
        created: firebase.firestore.FieldValue.serverTimestamp(),
        updated: firebase.firestore.FieldValue.serverTimestamp(),
        lastClientUpdateTime: firebase.firestore.FieldValue.serverTimestamp()
    },
    "users/test/folders/inVaultFolder": {
        name: "inVaultFolder",
        parentId: "vault",
        shared: false,
        starred: false,
        trashed: false,
        inVault: true,
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
    },
    "users/test/files/trashedFile": {
        name: "trashedFile",
        parentId: "root",
        size: 0,
        shared: false,
        starred: false,
        trashed: true,
        inVault: false,
        created: firebase.firestore.FieldValue.serverTimestamp(),
        updated: firebase.firestore.FieldValue.serverTimestamp(),
        lastClientUpdateTime: firebase.firestore.FieldValue.serverTimestamp()
    },
    "users/test/files/inVaultFile": {
        name: "inVaultFile",
        parentId: "vault",
        size: 0,
        shared: false,
        starred: false,
        trashed: false,
        inVault: true,
        created: firebase.firestore.FieldValue.serverTimestamp(),
        updated: firebase.firestore.FieldValue.serverTimestamp(),
        lastClientUpdateTime: firebase.firestore.FieldValue.serverTimestamp()
    }
}

module.exports.newFolderValidMockData = {
    name: "newFolder",
    parentId: "root",
    shared: false,
    starred: false,
    trashed: false,
    inVault: false,
    created: firebase.firestore.FieldValue.serverTimestamp(),
    updated: firebase.firestore.FieldValue.serverTimestamp(),
    lastClientUpdateTime: firebase.firestore.FieldValue.serverTimestamp()
}

module.exports.newFolderInvalidMockData = {
    name: "newFolder",
    parentId: "nonExistentFolderId",
    shared: false,
    starred: false,
    trashed: false,
    inVault: false,
    created: firebase.firestore.FieldValue.serverTimestamp(),
    updated: firebase.firestore.FieldValue.serverTimestamp(),
    lastClientUpdateTime: firebase.firestore.FieldValue.serverTimestamp()
}

module.exports.newFileValidMockData = {
    name: "newFile",
    parentId: "root",
    shared: false,
    starred: false,
    trashed: false,
    inVault: false,
    created: firebase.firestore.FieldValue.serverTimestamp(),
    updated: firebase.firestore.FieldValue.serverTimestamp(),
    lastClientUpdateTime: firebase.firestore.FieldValue.serverTimestamp()
}

module.exports.newFileInvalidMockData = {
    name: "newFile",
    parentId: "nonExistentFolderId",
    shared: false,
    starred: false,
    trashed: false,
    inVault: false,
    created: firebase.firestore.FieldValue.serverTimestamp(),
    updated: firebase.firestore.FieldValue.serverTimestamp(),
    lastClientUpdateTime: firebase.firestore.FieldValue.serverTimestamp()
}

module.exports.lockedVaultMockData = { "/users/test/vault/status": { locked: true } }

module.exports.unlockedVaultMockData = { "/users/test/vault/status": { locked: false } }

expect.extend({
    async toAllow(x)
    {
        let pass = false;

        try
        {
            await firebase.assertSucceeds(x);

            pass = true;
        } catch (err) {}

        return { pass, message: () => "Expected Firebase operation to be allowed, but it failed" };
    }
});

expect.extend({
    async toDeny(x)
    {
        let pass = false;

        try
        {
            await firebase.assertFails(x);

            pass = true;
        } catch (err) {}

        return { pass, message: () => "Expected Firebase operation to be denied, but it was allowed" };
    }
});