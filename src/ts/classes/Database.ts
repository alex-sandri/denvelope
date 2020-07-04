import type { firestore } from "firebase";

import File from "./File";
import Folder from "./Folder";

declare const firebase: any;

export default class Database
{
	private static instance: firestore.Firestore = firebase.firestore();

	public static async Add (collection: string, data: firestore.DocumentData)
	{
        const doc = await Database.instance.collection(collection).add(data);
        
        return doc.id;
    }

    public static async Set (collection: string, doc: string, data: firestore.DocumentData)
	{
        await Database.instance.collection(collection).doc(doc).set(data, { merge: true });
    }

	public static async Retrieve (collection: string, doc: string)
	{
        const snapshot = await Database.instance.collection(collection).doc(doc).get();

		return snapshot.data();
	}

	public static async Update (collection: string, doc: string, data: firestore.DocumentData)
	{
		await Database.instance.collection(collection).doc(doc).update(data);
	}

	public static async Delete (collection: string, doc: string)
	{
		await Database.instance.collection(collection).doc(doc).delete();
    }
    
    public static File = File

    public static Folder = Folder;
}