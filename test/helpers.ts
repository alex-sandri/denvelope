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
};

export const teardown = async () => Promise.all(firebase.apps().map(app => app.delete()));

export const getFirestoreServerTimestamp = () => firebase.firestore.FieldValue.serverTimestamp();

export const getFirestoreUpdateTimestamps = () => ({
	updated: getFirestoreServerTimestamp(),
	lastClientUpdateTime: firebase.firestore.Timestamp.now(),
});

export const getFirestoreCreationTimestamps = () => ({
	created: getFirestoreServerTimestamp(),
	...getFirestoreUpdateTimestamps(),
});

export const lockedVaultMockData = { "/users/test/vault/status": { locked: true } };

export const unlockedVaultMockData = { "/users/test/vault/status": { locked: false } };

expect.extend({
	async toAllow(x)
	{
		let pass: boolean = false;

		try
		{
			await firebase.assertSucceeds(x);

			pass = true;
		}
		catch (err) {}

		return { pass, message: () => "Expected Firebase operation to be allowed, but it failed" };
	},
});

expect.extend({
	async toDeny(x)
	{
		let pass: boolean = false;

		try
		{
			await firebase.assertFails(x);

			pass = true;
		}
		catch (err) {}

		return { pass, message: () => "Expected Firebase operation to be denied, but it was allowed" };
	},
});