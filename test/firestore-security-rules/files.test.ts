import * as firebase from "@firebase/testing";

import {
	setup,
	teardown,
	mockData,
	newFileValidMockData,
	newFileInvalidMockData,
	unlockedVaultMockData,
	lockedVaultMockData,
} from "../helpers";

describe("OWNER:TRUE", () =>
{
	afterEach(async () => teardown());

	describe("READ", () =>
	{
		describe("ALLOW", () =>
		{
			test("GENERIC", async () =>
			{
				const db = await setup({ uid: "test" }, mockData);

				const ref = db.collection("users/test/files").doc("fileId");

				expect(ref.get()).toAllow();
			});
		});

		describe("DENY", () =>
		{
			test("VAULT:LOCKED", async () =>
			{
				const db = await setup({ uid: "test" }, { ...mockData, ...lockedVaultMockData });

				const ref = db.collection("users/test/files").doc("inVaultFile");

				expect(ref.get()).toDeny();
			});
		});
	});

	describe("CREATE", () =>
	{
		describe("ALLOW", () =>
		{
			test("GENERIC", async () =>
			{
				const db = await setup({ uid: "test" }, mockData);

				const ref = db.collection("users/test/files");

				expect(ref.add(newFileValidMockData)).toAllow();
			});
		});

		describe("DENY", () =>
		{
			test("GENERIC", async () =>
			{
				const db = await setup({ uid: "test" }, mockData);

				const ref = db.collection("users/test/files");

				expect(ref.add(newFileInvalidMockData)).toDeny();
			});
		});
	});

	describe("UPDATE", () =>
	{
		describe("ALLOW", () =>
		{
			test("GENERIC", async () =>
			{
				const db = await setup({ uid: "test" }, mockData);

				const ref = db.collection("users/test/files").doc("fileId");

				expect(ref.update({
					name: "testName",
					updated: firebase.firestore.FieldValue.serverTimestamp(),
					lastClientUpdateTime: firebase.firestore.FieldValue.serverTimestamp(),
				})).toAllow();

				expect(ref.update({
					parentId: "folderId",
					updated: firebase.firestore.FieldValue.serverTimestamp(),
					lastClientUpdateTime: firebase.firestore.FieldValue.serverTimestamp(),
				})).toAllow();
			});

			test("VAULT:UNLOCKED", async () =>
			{
				const db = await setup({ uid: "test" }, { ...mockData, ...unlockedVaultMockData });

				const ref = db.collection("users/test/files").doc("fileId");

				expect(ref.update({
					parentId: "vault",
					inVault: true,
					updated: firebase.firestore.FieldValue.serverTimestamp(),
					lastClientUpdateTime: firebase.firestore.FieldValue.serverTimestamp(),
				})).toAllow();
			});
		});

		describe("DENY", () =>
		{
			test("GENERIC", async () =>
			{
				const db = await setup({ uid: "test" }, mockData);

				const ref = db.collection("users/test/files").doc("fileId");

				expect(ref.update({
					parentId: "nonExistentFolderId",
					updated: firebase.firestore.FieldValue.serverTimestamp(),
					lastClientUpdateTime: firebase.firestore.FieldValue.serverTimestamp(),
				})).toDeny();

				expect(ref.update({
					updated: firebase.firestore.FieldValue.serverTimestamp(),
					lastClientUpdateTime: firebase.firestore.Timestamp.fromDate(new Date("1/1/1970")),
				})).toDeny();
			});

			test("VAULT:LOCKED", async () =>
			{
				const db = await setup({ uid: "test" }, { ...mockData, ...lockedVaultMockData });

				const ref = db.collection("users/test/files").doc("fileId");

				expect(ref.update({
					parentId: "vault",
					inVault: true,
					updated: firebase.firestore.FieldValue.serverTimestamp(),
					lastClientUpdateTime: firebase.firestore.FieldValue.serverTimestamp(),
				})).toDeny();
			});

			test("VAULT:UNLOCKED", async () =>
			{
				const db = await setup({ uid: "test" }, { ...mockData, ...unlockedVaultMockData });

				const ref = db.collection("users/test/folders").doc("inVaultFolder");

				expect(ref.update({
					trashed: true,
					updated: firebase.firestore.FieldValue.serverTimestamp(),
					lastClientUpdateTime: firebase.firestore.FieldValue.serverTimestamp(),
				})).toDeny();

				expect(ref.update({
					parentId: "root",
					updated: firebase.firestore.FieldValue.serverTimestamp(),
					lastClientUpdateTime: firebase.firestore.FieldValue.serverTimestamp(),
				})).toDeny();

				expect(ref.update({
					inVault: false,
					updated: firebase.firestore.FieldValue.serverTimestamp(),
					lastClientUpdateTime: firebase.firestore.FieldValue.serverTimestamp(),
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
				const db = await setup({ uid: "test" }, mockData);

				const ref = db.collection("users/test/files").doc("trashedFile");

				expect(ref.delete()).toAllow();
			});

			test("VAULT:UNLOCKED", async () =>
			{
				const db = await setup({ uid: "test" }, { ...mockData, ...unlockedVaultMockData });

				const ref = db.collection("users/test/files").doc("inVaultFile");

				expect(ref.delete()).toAllow();
			});
		});

		describe("DENY", () =>
		{
			test("GENERIC", async () =>
			{
				const db = await setup({ uid: "test" }, mockData);

				const ref = db.collection("users/test/files").doc("fileId");

				expect(ref.delete()).toDeny();
			});

			test("VAULT:LOCKED", async () =>
			{
				const db = await setup({ uid: "test" }, { ...mockData, ...lockedVaultMockData });

				const ref = db.collection("users/test/files").doc("inVaultFile");

				expect(ref.delete()).toDeny();
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
					const db = await setup({ uid: "test1" }, mockData);

					expect(db.collection("users/test/files").add(newFileValidMockData)).toDeny();
				});
			});
		});

		describe("UPDATE", () =>
		{
			describe("DENY", () =>
			{
				test("GENERIC", async () =>
				{
					const db = await setup({ uid: "test1" }, mockData);

					const file = db.collection("users/test/files").doc("fileId");

					expect(file.update({
						name: "aNewFileName",
						updated: firebase.firestore.FieldValue.serverTimestamp(),
						lastClientUpdateTime: firebase.firestore.FieldValue.serverTimestamp(),
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
					const db = await setup({ uid: "test1" }, mockData);

					const file = db.collection("users/test/files").doc("fileId");

					expect(file.delete()).toDeny();
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
					const db = await setup({ uid: "test1" }, mockData);

					const ref = db.collection("users/test/files").doc("sharedFile");

					expect(ref.get()).toAllow();
				});
			});

			describe("DENY", () =>
			{
				test("GENERIC", async () =>
				{
					const db = await setup({ uid: "test1" }, mockData);

					const files = [
						db.collection("users/test/files").doc("fileId"),
						db.collection("users/test/files").doc("inVaultFile"),
					];

					for await (const file of files) expect(file.get()).toDeny();
				});
			});
		});
	});
});