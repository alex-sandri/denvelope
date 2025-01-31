import * as firebase from "@firebase/testing";

import {
	setup,
	teardown,
	unlockedVaultMockData,
	lockedVaultMockData,
	getFirestoreCreationTimestamps,
	getFirestoreUpdateTimestamps,
} from "../helpers";

const mockData = {
	initial: {
		"users/test/folders/folderId": {
			name: "folder",
			parentId: "root",
			shared: false,
			starred: false,
			trashed: false,
			inVault: false,
			...getFirestoreCreationTimestamps(),
		},
		"users/test/folders/anotherFolderId": {
			name: "folder1",
			parentId: "root",
			shared: false,
			starred: false,
			trashed: false,
			inVault: false,
			...getFirestoreCreationTimestamps(),
		},
		"users/test/folders/trashedFolder": {
			name: "trashedFolder",
			parentId: "root",
			shared: false,
			starred: false,
			trashed: true,
			inVault: false,
			...getFirestoreCreationTimestamps(),
		},
		"users/test/folders/inVaultFolder": {
			name: "inVaultFolder",
			parentId: "vault",
			shared: false,
			starred: false,
			trashed: false,
			inVault: true,
			...getFirestoreCreationTimestamps(),
		},
	},
	valid: [
		{
			name: "newFolder",
			parentId: "root",
			shared: false,
			starred: false,
			trashed: false,
			inVault: false,
			...getFirestoreCreationTimestamps(),
		},
	],
	invalid: [
		{
			name: "newFolder",
			parentId: "nonExistentFolderId",
			shared: false,
			starred: false,
			trashed: false,
			inVault: false,
			...getFirestoreCreationTimestamps(),
		},
	],
};

export default mockData.initial;

const FOLDERS_COLLECTION = "users/test/folders";

describe("OWNER:TRUE", () =>
{
	afterEach(async () => await teardown());

	describe("READ", () =>
	{
		describe("ALLOW", () =>
		{
			test("GENERIC", async () =>
			{
				const db = await setup({ uid: "test" }, mockData.initial);

				const ref = db.collection("users/test/folders").doc("folderId");

				await expect(ref.get()).toAllow();
			});
		});

		describe("DENY", () =>
		{
			test("VAULT:LOCKED", async () =>
			{
				const db = await setup({ uid: "test" }, { ...mockData.initial, ...lockedVaultMockData });

				const ref = db.collection("users/test/folders").doc("inVaultFolder");

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
				const db = await setup({ uid: "test" }, mockData.initial);

				for (const data of mockData.valid)
					await expect(db.collection(FOLDERS_COLLECTION).add(data)).toAllow();
			});
		});

		describe("DENY", () =>
		{
			test("GENERIC", async () =>
			{
				const db = await setup({ uid: "test" }, mockData.initial);

				for (const data of mockData.invalid)
					await expect(db.collection(FOLDERS_COLLECTION).add(data)).toDeny();
			});
		});
	});

	describe("UPDATE", () =>
	{
		describe("ALLOW", () =>
		{
			test("GENERIC", async () =>
			{
				const db = await setup({ uid: "test" }, mockData.initial);

				const ref = db.collection("users/test/folders").doc("folderId");

				await expect(ref.update({
					name: "testName",
					...getFirestoreUpdateTimestamps(),
				})).toAllow();

				await expect(ref.update({
					parentId: "anotherFolderId",
					...getFirestoreUpdateTimestamps(),
				})).toAllow();
			});

			test("VAULT:UNLOCKED", async () =>
			{
				const db = await setup({ uid: "test" }, { ...mockData.initial, ...unlockedVaultMockData });

				const ref = db.collection("users/test/folders").doc("folderId");

				await expect(ref.update({
					parentId: "vault",
					inVault: true,
					...getFirestoreUpdateTimestamps(),
				})).toAllow();
			});
		});

		describe("DENY", () =>
		{
			test("GENERIC", async () =>
			{
				const db = await setup({ uid: "test" }, mockData.initial);

				const ref = db.collection("users/test/folders").doc("folderId");

				await expect(ref.update({
					parentId: "folderId",
					...getFirestoreUpdateTimestamps(),
				})).toDeny();

				await expect(ref.update({
					parentId: "nonExistentFolderId",
					...getFirestoreUpdateTimestamps(),
				})).toDeny();

				await expect(ref.update({
					...getFirestoreUpdateTimestamps(),
					lastClientUpdateTime: firebase.firestore.Timestamp.fromDate(new Date("1/1/1970")),
				})).toDeny();
			});

			test("VAULT:LOCKED", async () =>
			{
				const db = await setup({ uid: "test" }, { ...mockData.initial, ...lockedVaultMockData });

				const ref = db.collection("users/test/folders").doc("folderId");

				await expect(ref.update({
					parentId: "vault",
					inVault: true,
					...getFirestoreUpdateTimestamps(),
				})).toDeny();
			});

			test("VAULT:UNLOCKED", async () =>
			{
				const db = await setup({ uid: "test" }, { ...mockData.initial, ...unlockedVaultMockData });

				const ref = db.collection("users/test/folders").doc("inVaultFolder");

				await expect(ref.update({
					trashed: true,
					...getFirestoreUpdateTimestamps(),
				})).toDeny();

				await expect(ref.update({
					parentId: "root",
					...getFirestoreUpdateTimestamps(),
				})).toDeny();

				await expect(ref.update({
					inVault: false,
					...getFirestoreUpdateTimestamps(),
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
				const db = await setup({ uid: "test" }, mockData.initial);

				const ref = db.collection("users/test/folders").doc("trashedFolder");

				await expect(ref.delete()).toAllow();
			});

			test("VAULT:UNLOCKED", async () =>
			{
				const db = await setup({ uid: "test" }, { ...mockData.initial, ...unlockedVaultMockData });

				const ref = db.collection("users/test/folders").doc("inVaultFolder");

				await expect(ref.delete()).toAllow();
			});
		});

		describe("DENY", () =>
		{
			test("GENERIC", async () =>
			{
				const db = await setup({ uid: "test" }, mockData.initial);

				const ref = db.collection("users/test/folders").doc("folderId");

				await expect(ref.delete()).toDeny();
			});

			test("VAULT:LOCKED", async () =>
			{
				const db = await setup({ uid: "test" }, { ...mockData.initial, ...lockedVaultMockData });

				const ref = db.collection("users/test/folders").doc("inVaultFolder");

				await expect(ref.delete()).toDeny();
			});
		});
	});
});