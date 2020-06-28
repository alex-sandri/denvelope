import * as firebase from "@firebase/testing";
import * as fs from "fs";

declare global
{
    namespace jest
    {
        interface Matchers<R>
        {
            toAllow(): CustomMatcherResult,
            toDeny(): CustomMatcherResult,
        }
    }
}

export const setup = async (auth?: any, data?: any) =>
{
    const projectId = `rules-test-${Date.now()}`;

    const app = firebase.initializeTestApp({ projectId, auth });

    const db = app.firestore();

    await firebase.loadFirestoreRules({ projectId, rules: fs.readFileSync("firestore-no.rules", "utf8") });

    if (data)
        for (const key in data)
            await db.doc(key).set(data[key]);

    await firebase.loadFirestoreRules({ projectId, rules: fs.readFileSync("firestore.rules", "utf8") });

    return db;
}

export const teardown = async () => Promise.all(firebase.apps().map(app => app.delete()));

export const mockData = {
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
    },
    "users/test/files/sharedFile": {
        name: "sharedFile",
        parentId: "root",
        size: 0,
        shared: true,
        starred: false,
        trashed: false,
        inVault: false,
        created: firebase.firestore.FieldValue.serverTimestamp(),
        updated: firebase.firestore.FieldValue.serverTimestamp(),
        lastClientUpdateTime: firebase.firestore.FieldValue.serverTimestamp()
    }
}

export const newFolderValidMockData = {
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

export const newFolderInvalidMockData = {
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

export const newFileValidMockData = {
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

export const newFileInvalidMockData = {
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

export const lockedVaultMockData = { "/users/test/vault/status": { locked: true } }

export const unlockedVaultMockData = { "/users/test/vault/status": { locked: false } }

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