import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as os from "os";
import * as fs from "fs";
import * as path from "path";

import * as serviceAccount from "./service-account-key.json";

const archiver = require("archiver");
const bcrypt = require("bcrypt");

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as any),
    databaseURL: "https://denvelope-firebase.firebaseio.com",
    storageBucket: "denvelope-firebase.appspot.com",
});

const region = "europe-west1";

const auth = admin.auth();
const db = admin.firestore();
const storage = admin.storage();

const GetCurrentTimestamp = () : FirebaseFirestore.FieldValue => admin.firestore.FieldValue.serverTimestamp();

export const userCreated = functions.region(region).auth.user().onCreate(async user =>
{
    void db.collection("users").doc(user.uid).set({
        created: GetCurrentTimestamp(),
        usedStorage: 0,
        maxStorage: 100 * 1000 * 1000, // 100MB
    });

    return user;
});

export const userDeleted = functions.region(region).auth.user().onDelete(async user =>
{
    const batch = db.batch();

    await db.collection("users").doc(user.uid).delete();

    await db.collection(`users/${user.uid}/folders`).where("parent", "==", "root").get().then(docs => docs.forEach(doc => batch.delete(doc.ref)));

    await db.collection(`users/${user.uid}/files`).where("parent", "==", "root").get().then(docs => docs.forEach(doc => batch.delete(doc.ref)));

    void batch.commit();
    
    return user;
});

export const signOutUserFromAllDevices = functions.region(region).https.onCall((data, context) =>
{
    if (!context.auth) return;

    void admin.auth().revokeRefreshTokens(context.auth.uid);
});

export const fileUploaded = functions.region(region).storage.object().onFinalize(async object =>
{
    const userId = (<string>object.name).split("/")[0];
    const fileId = (<string>object.name).split("/")[1];

    const size = parseInt(object.size);

    // Avoid continuing if the event is from a compressed folder being uploaded
    if (fileId.indexOf(".") > -1) return object;

    const fileRef = db.collection(`users/${userId}/files`).doc(fileId);

    const userSnap = await db.collection("users").doc(userId).get();

    const fileSnap = await fileRef.get();

    const userData = <FirebaseFirestore.DocumentData>userSnap.data();

    if (!userSnap.exists || !fileSnap.exists || userData.usedStorage + size > userData.maxStorage) return fileRef.delete();

    await fileSnap.ref.update({
        size: size
    });

    return object;
});

export const fileUpdated = functions.region(region).firestore.document("users/{userId}/files/{fileId}").onUpdate(async (change, context) =>
{
    const userId = context.params.userId;
    const fileId = context.params.fileId;

    const afterData = <FirebaseFirestore.DocumentData>change.after.data();
    const beforeData = <FirebaseFirestore.DocumentData>change.before.data();

    if (afterData.shared !== beforeData.shared || afterData.inVault !== beforeData.inVault)
        void storage.bucket().file(`${userId}/${fileId}`).setMetadata({
            metadata: {
                shared: `${afterData.shared}`,
                inVault: `${afterData.inVault}`
            }
        });

    if (afterData.trashed !== beforeData.trashed && afterData.trashed === false)
        if (afterData.parentId !== "root" && !(await db.collection(`users/${userId}/folders`).doc(afterData.parentId).get()).exists)
            void change.after.ref.update("parentId", "root");

    if (afterData.size !== beforeData.size)
        void db.collection("users").doc(userId)
            .update("usedStorage", admin.firestore.FieldValue.increment(afterData.size - (beforeData.size || 0)));

    return change;
});

export const fileDeleted = functions.region(region).firestore.document("users/{userId}/files/{fileId}").onDelete(async (doc, context) => {
    const userId = context.params.userId;
    const fileId = context.params.fileId;

    await storage.bucket().file(`${userId}/${fileId}`).delete();

    const size = (<FirebaseFirestore.DocumentData>doc.data()).size;

    // Not executed if size is equal to 0 or if the file was deleted before adding its size because the storage space wasn't enough
    if (size) await db.collection("users").doc(userId).update("usedStorage", admin.firestore.FieldValue.increment(-size));

    return doc;
});

export const folderUpdated = functions.region(region).firestore.document("users/{userId}/folders/{folderId}").onUpdate(async (change, context) =>
{
    const userId = context.params.userId;
    const folderId = context.params.folderId;

    const afterData = <FirebaseFirestore.DocumentData>change.after.data();
    const beforeData = <FirebaseFirestore.DocumentData>change.before.data();

    const inVault = afterData.inVault;

    if (inVault !== beforeData.inVault)
    {
        const batch = db.batch();

        await db.collection(`users/${userId}/folders`).where("parentId", "==", folderId).get().then(docs =>
            docs.forEach(doc => batch.update(doc.ref, { inVault })));

        await db.collection(`users/${userId}/files`).where("parentId", "==", folderId).get().then(docs =>
            docs.forEach(doc => batch.update(doc.ref, { inVault })));

        await batch.commit();
    }
});

export const folderDeleted = functions.region(region).firestore.document("users/{userId}/folders/{folderId}").onDelete(async (snapshot, context) =>
{
    const userId = context.params.userId;
    const folderId = context.params.folderId;

    const batch = db.batch();

    await db.collection(`users/${userId}/folders`).where("parentId", "==", folderId).where("trashed", "==", false).get().then(docs =>
        docs.forEach(doc => batch.delete(doc.ref)));

    await db.collection(`users/${userId}/files`).where("parentId", "==", folderId).where("trashed", "==", false).get().then(docs =>
        docs.forEach(doc => batch.delete(doc.ref)));

    void batch.commit();

    const fileRefs = [
        storage.bucket().file(`${userId}/${folderId}.zip`),
        storage.bucket().file(`${userId}/${folderId}.tar`),
        storage.bucket().file(`${userId}/${folderId}.tar.gz`)
    ];

    for (const fileRef of fileRefs)
        // If an archive of this folder was never created the file does not exist in the bucket
        await fileRef.exists().then(data =>
        {
            // data[0] is a boolean that represents the file existance
            if (data[0]) void fileRef.delete();
        });

    return snapshot;
});

export const shareFolder = functions.region(region).https.onCall(async (data, context) =>
{
    if (!context.auth || !data.id || typeof data.shared !== "boolean") return;

    await ShareFolder(context.auth.uid, data.id, data.shared);
});

const ShareFolder = async (userId : string, folderId : string, shared : boolean) =>
{
    await db.collection(`users/${userId}/folders`).doc(folderId).get().then(async snapshot =>
    {
        if (!snapshot.exists) return;

        await snapshot.ref.update({ shared });

        await db.collection(`users/${userId}/folders`).where("parentId", "==", folderId).get().then(async foldersSnapshot =>
        {
            for (const folder of foldersSnapshot.docs) await ShareFolder(userId, folder.id, shared);
        });

        await db.collection(`users/${userId}/files`).where("parentId", "==", folderId).get().then(async filesSnapshot =>
        {
            for (const file of filesSnapshot.docs) await file.ref.update({ shared });
        });
    });
}

export const createFolderArchive = functions.region(region).runWith({
    memory: "2GB",
    timeoutSeconds: 540
}).https.onCall(async (data, context) =>
{
    if (!data.userId || !data.id || !data.format) return;
    
    await CreateFolderArchive(data.userId, data.id, context.auth !== undefined, data.format);
});

export const emptyTrash = functions.region(region).https.onCall(async (data, context) =>
{
    if (!context.auth) return;

    const userId : string = context.auth.uid;

    const batch = db.batch();

    await db.collection(`users/${userId}/folders`).where("trashed", "==", true).get().then(docs => docs.forEach(doc => batch.delete(doc.ref)));

    await db.collection(`users/${userId}/files`).where("trashed", "==", true).get().then(docs => docs.forEach(doc => batch.delete(doc.ref)));

    void batch.commit();
});

export const saveToMyAccount = functions.region(region).https.onCall(async (data, context) =>
{
    if (!context.auth || !data.userId || !data.id || !data.type || (context.auth.uid === data.userId)) return;

    const userId : string = context.auth.uid;
    
    const contentOwnerId : string = data.userId;
    const contentId : string = data.id;
    const contentType : string = data.type;

    if (contentType !== "folder" && contentType !== "file") return;

    await db.collection(`users/${contentOwnerId}/${contentType}s`).doc(contentId).get().then(async snapshot =>
    {
        if (!snapshot.exists || !(<FirebaseFirestore.DocumentData>snapshot.data()).shared) return;

        const docData = <FirebaseFirestore.DocumentData>snapshot.data();

        if (docData.size) docData.size = 0; // Reset to 0 to avoid the update function on upload to ignore the change as the field isn't actually changed

        let name : string = docData.name;
        const end = name.replace(/.$/, (c : string) => String.fromCharCode(c.charCodeAt(0) + 1));

        const tempSnapshot = await db
            .collection(`users/${userId}/${contentType}s`)
            .where("parentId", "==", "root")
            .where("name", ">=", name)
            .where("name", "<", end)
            .get();

        if (tempSnapshot.size > 0)
        {
            let i = 1;
            let tempName : string;

            do
            {
                if (contentType === "file")
                    tempName = (name.substring(0, name.lastIndexOf(".") > -1 ? name.lastIndexOf(".") : undefined) +
                        ` (${i++})` +
                        (name.indexOf(".") > -1 ? "." : "") +
                        (name.indexOf(".") > -1 ? name.split(".").pop() : "")).trim();
                else tempName = name + ` (${i++})`;
            }
            while (tempSnapshot.docs.filter((doc : any) => doc.data().name === tempName).length > 0);

            name = tempName;
        }

        docData.name = name;

        await db.collection(`users/${userId}/${contentType}s`).add({
            ...docData,
            parentId: "root"
        }).then(async doc =>
        {
            if (contentType === "file") await storage.bucket().file(`${contentOwnerId}/${contentId}`).copy(`${userId}/${doc.id}`);
            else await CopyFolderToAccount(contentOwnerId, userId, contentId);
        });
    });
});

// Run with 2GB of memory to get the 2.4GHz CPU for faster hashing
export const createVault = functions.region(region).runWith({ memory: "2GB" }).https.onCall(async (data, context) =>
{
    if (!context.auth || !data.pin) return;

    const userId : string = context.auth.uid;
    const pin : string = data.pin;

    const success = typeof(pin) === "string" && pin !== null && pin.length >= 4;

    if (success)
    {
        await db.collection(`users/${userId}/vault`).doc("config").set({ pin: await bcrypt.hash(pin, 15) });
    
        await db.collection(`users/${userId}/vault`).doc("status").set({ locked: false });

        await auth.setCustomUserClaims(userId, { vaultLocked: false });
    }

    return { success };
});

export const lockVault = functions.region(region).https.onCall(async (data, context) =>
{
    if (!context.auth) return;

    const userId : string = context.auth.uid;

    await db.collection(`users/${userId}/vault`).doc("status").update("locked", true);

    await auth.setCustomUserClaims(userId, { vaultLocked: true });
});

export const addFileInVault = functions.region(region).runWith({ memory: "2GB", timeoutSeconds: 540 }).https.onCall(async () =>
{
    const users = await db.collection("users").get();

    for (const user of users.docs)
        await db.collection(`users/${user.id}/files`).get().then(async filesSnapshot =>
        {
            for (const file of filesSnapshot.docs)
                await storage.bucket().file(`${user.id}/${file.id}`).setMetadata({ metadata: {
                    shared: `${file.data().shared}`,
                    inVault: `${file.data().inVault}`
                } });
        });
});

export const unlockVault = functions.region(region).runWith({ memory: "2GB" }).https.onCall(async (data, context) =>
{
    if (!context.auth || !data.pin) return;

    const userId : string = context.auth.uid;
    const pin : string = data.pin;

    const vaultConfig = await db.collection(`users/${userId}/vault`).doc("config").get();

    const allowUnlock = await bcrypt.compare(pin, (<FirebaseFirestore.DocumentData>vaultConfig.data()).pin);

    if (allowUnlock)
    {
        await db.collection(`users/${userId}/vault`).doc("status").update("locked", false);

        await auth.setCustomUserClaims(userId, { vaultLocked: false });
    }

    return { success: allowUnlock };
});

const CopyFolderToAccount = async (fromUserId : string, toUserId : string, folderId : string) => new Promise(async resolve =>
{
    await db.collection(`users/${fromUserId}/folders`).where("parentId", "==", folderId).get().then(async snapshot =>
    {
        for (const doc of snapshot.docs)
        {
            await db.collection(`users/${toUserId}/folders`).add({
                ...doc.data(),
                created: GetCurrentTimestamp(),
                updated: GetCurrentTimestamp(),
                shared: false,
                starred: false,
                trashed: false,
            });
    
            await CopyFolderToAccount(fromUserId, toUserId, doc.id);
        }
    });

    await db.collection(`users/${fromUserId}/files`).where("parentId", "==", folderId).get().then(async snapshot =>
    {
        for (const doc of snapshot.docs)
            await db.collection(`users/${toUserId}/files`).add({
                ...doc.data(),
                created: GetCurrentTimestamp(),
                updated: GetCurrentTimestamp(),
                shared: false,
                starred: false,
                trashed: false
            }).then(async snap => await storage.bucket().file(`${fromUserId}/${doc.id}`).copy(`${toUserId}/${snap.id}`));
    });

    resolve();
});

const CreateFolderArchive = async (userId : string, folderId : string, isUserAuthenticated : boolean, format : string) : Promise<void> => new Promise(async (resolve, reject) =>
{
    const folderDoc = await db.collection(`users/${userId}/folders`).doc(folderId).get();

    const folderData = folderDoc.data();

    if (!folderDoc.exists || !folderData || (!isUserAuthenticated && !folderData.shared) || !["zip", "tar", "tar.gz"].includes(format))
    {
        reject();

        return;
    }

    let tmpPath = path.join(os.tmpdir(), userId);
    
    if (!fs.existsSync(tmpPath)) fs.mkdirSync(tmpPath);
    
    tmpPath = path.join(tmpPath, folderId);
    if (!fs.existsSync(tmpPath)) fs.mkdirSync(tmpPath);
    
    tmpPath = path.join(tmpPath, `${Math.round(Date.now())}`);
    fs.mkdirSync(tmpPath);
    
    const output = fs.createWriteStream(path.join(tmpPath, `${folderDoc.id}.${format}`));

    const archiverOptions = format === "zip" ? { zlib: { level: 9 } } : (format === "tar.gz" ? { gzip: true, gzipOptions: { level: 1 } } : {})
    
    const archive = archiver(format === "zip" ? "zip" : "tar", archiverOptions);
    
    output.on("close", async () =>
    {
        await storage.bucket().upload(path.join(tmpPath, `${folderDoc.id}.${format}`), { destination: `${userId}/${folderId}.${format}` });

        resolve();
    });

    archive.on("warning", (err : Error) => reject(err));
          
    archive.on("error", (err : Error) => reject(err));
          
    archive.pipe(output);
    
    const AddFilesToArchive = (parentFolderId : string, folderPath : string) => new Promise(async (addFilesResolve, AddFilesReject) =>
    {
        const RetrieveFiles = () => new Promise(async archiveResolve =>
        {
            const files = await db.collection(`users/${userId}/files`).where("parentId", "==", parentFolderId).get();

            for (const file of files.docs)
            {
                const fileName = file.data().name;
            
                const fileTmpPath = path.join(tmpPath, fileName);
                const filePath = path.join(folderPath, fileName);
            
                await storage.bucket().file(`${userId}/${file.id}`).download({
                    destination: fileTmpPath
                });
            
                archive.file(fileTmpPath, {
                    name: filePath
                });
            }

            archiveResolve();
        });

        void RetrieveFiles().then(() => new Promise(async retrieveFilesResolve =>
        {
            const folders = await db.collection(`users/${userId}/folders`).where("parentId", "==", parentFolderId).get();

            for (const folder of folders.docs) await AddFilesToArchive(folder.id, path.join(folderPath, folder.data().name));

            retrieveFilesResolve();
        }).then(() => addFilesResolve()));
    });
    
    await AddFilesToArchive(folderId, "/");

    archive.finalize();
});