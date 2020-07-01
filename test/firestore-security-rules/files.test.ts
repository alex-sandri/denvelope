import * as firebase from "@firebase/testing";

import {
	setup,
	teardown,
	unlockedVaultMockData,
	lockedVaultMockData,
	getFirestoreCreationTimestamps,
	getFirestoreUpdateTimestamps,
} from "../helpers";

import foldersMockData from "./folders.test";

const FILES_COLLECTION = "users/test/files";

const mockData = {
	initial: {
		...foldersMockData,
		"users/test/files/fileId": {
			name: "file",
			parentId: "root",
			size: 42,
			shared: false,
			starred: false,
			trashed: false,
			inVault: false,
			...getFirestoreCreationTimestamps(),
		},
		"users/test/files/anotherFileId": {
			name: "file1",
			parentId: "root",
			size: 0,
			shared: false,
			starred: false,
			trashed: false,
			inVault: false,
			...getFirestoreCreationTimestamps(),
		},
		"users/test/files/trashedFile": {
			name: "trashedFile",
			parentId: "root",
			size: 0,
			shared: false,
			starred: false,
			trashed: true,
			inVault: false,
			...getFirestoreCreationTimestamps(),
		},
		"users/test/files/inVaultFile": {
			name: "inVaultFile",
			parentId: "vault",
			size: 0,
			shared: false,
			starred: false,
			trashed: false,
			inVault: true,
			...getFirestoreCreationTimestamps(),
		},
		"users/test/files/sharedFile": {
			name: "sharedFile",
			parentId: "root",
			size: 0,
			shared: true,
			starred: false,
			trashed: false,
			inVault: false,
			...getFirestoreCreationTimestamps(),
		},
	},
	valid: [
		{
			name: "newFile",
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
			name: "newFile",
			parentId: "nonExistentFolderId",
			shared: false,
			starred: false,
			trashed: false,
			inVault: false,
			...getFirestoreCreationTimestamps(),
		},
	],
};

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

				const ref = db.collection("users/test/files").doc("fileId");

				await expect(ref.get()).toAllow();
			});
		});

		describe("DENY", () =>
		{
			test("VAULT:LOCKED", async () =>
			{
				const db = await setup({ uid: "test" }, { ...mockData.initial, ...lockedVaultMockData });

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
				const db = await setup({ uid: "test" }, mockData.initial);

				for (const data of mockData.valid)
					await expect(db.collection(FILES_COLLECTION).add(data)).toAllow();
			});
		});

		describe("DENY", () =>
		{
			test("GENERIC", async () =>
			{
				const db = await setup({ uid: "test" }, mockData.initial);

				for (const data of mockData.invalid)
					await expect(db.collection(FILES_COLLECTION).add(data)).toDeny();
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

				const ref = db.collection("users/test/files").doc("fileId");

				await expect(ref.update({
					name: "testName",
					...getFirestoreUpdateTimestamps(),
				})).toAllow();

				await expect(ref.update({
					parentId: "folderId",
					...getFirestoreUpdateTimestamps(),
				})).toAllow();
			});

			test("VAULT:UNLOCKED", async () =>
			{
				const db = await setup({ uid: "test" }, { ...mockData.initial, ...unlockedVaultMockData });

				const ref = db.collection("users/test/files").doc("fileId");

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

				const ref = db.collection("users/test/files").doc("fileId");

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

				const ref = db.collection("users/test/files").doc("fileId");

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

				const ref = db.collection("users/test/files").doc("trashedFile");

				await expect(ref.delete()).toAllow();
			});

			test("VAULT:UNLOCKED", async () =>
			{
				const db = await setup({ uid: "test" }, { ...mockData.initial, ...unlockedVaultMockData });

				const ref = db.collection("users/test/files").doc("inVaultFile");

				await expect(ref.delete()).toAllow();
			});
		});

		describe("DENY", () =>
		{
			test("GENERIC", async () =>
			{
				const db = await setup({ uid: "test" }, mockData.initial);

				const ref = db.collection("users/test/files").doc("fileId");

				await expect(ref.delete()).toDeny();
			});

			test("VAULT:LOCKED", async () =>
			{
				const db = await setup({ uid: "test" }, { ...mockData.initial, ...lockedVaultMockData });

				const ref = db.collection("users/test/files").doc("inVaultFile");

				await expect(ref.delete()).toDeny();
			});
		});
	});
});

describe("OWNER:FALSE", () =>
{
	afterEach(async () => teardown());

	describe("GENERIC", () =>
	{
		describe("CREATE", () =>
		{
			describe("DENY", () =>
			{
				test("GENERIC", async () =>
				{
					const db = await setup({ uid: "test1" }, mockData.initial);

					for (const data of mockData.valid)
						await expect(db.collection(FILES_COLLECTION).add(data)).toDeny();
				});
			});
		});

		describe("UPDATE", () =>
		{
			describe("DENY", () =>
			{
				test("GENERIC", async () =>
				{
					const db = await setup({ uid: "test1" }, mockData.initial);

					const file = db.collection("users/test/files").doc("fileId");

					await expect(file.update({
						name: "aNewFileName",
						...getFirestoreUpdateTimestamps(),
					})).toDeny();
				});
			});
		});

		describe("DELETE", () =>
		{
			describe("DENY", () =>
			{
				test("GENERIC", async () =>
				{
					const db = await setup({ uid: "test1" }, mockData.initial);

					const file = db.collection("users/test/files").doc("fileId");

					await expect(file.delete()).toDeny();
				});
			});
		});
	});

	describe("SHARED:TRUE", () =>
	{
		describe("READ", () =>
		{
			describe("ALLOW", () =>
			{
				test("GENERIC", async () =>
				{
					const db = await setup({ uid: "test1" }, mockData.initial);

					const ref = db.collection("users/test/files").doc("sharedFile");

					await expect(ref.get()).toAllow();
				});
			});

			describe("DENY", () =>
			{
				test("GENERIC", async () =>
				{
					const db = await setup({ uid: "test1" }, mockData.initial);

					const files = [
						db.collection("users/test/files").doc("fileId"),
						db.collection("users/test/files").doc("inVaultFile"),
					];

					for await (const file of files) await expect(file.get()).toDeny();
				});
			});
		});
	});
});