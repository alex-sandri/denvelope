import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as os from "os";
import * as fs from "fs-extra";
import * as path from "path";
import Stripe from "stripe";

import * as serviceAccount from "./service-account-key.json";

const archiver = require("archiver");
const bcrypt = require("bcrypt");

const stripe = new Stripe(functions.config().stripe.key, { apiVersion: "2020-03-02" });
const STRIPE_WEBHOOK_SECRET = functions.config().stripe.webhook_secret;

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as any),
    databaseURL: "https://denvelope-firebase.firebaseio.com",
    storageBucket: "denvelope-firebase.appspot.com",
});

const FUNCTIONS_REGION = "europe-west1";

const auth = admin.auth();
const db = admin.firestore();
const storage = admin.storage();

const FREE_STORAGE : number = 100 * 1000 * 1000; // 100MB
const STARTER_STORAGE : number = 1 * 1000 * 1000 * 1000; // 1GB
const ADVANCED_STORAGE : number = 10 * 1000 * 1000 * 1000; // 10GB

const GetCurrentTimestamp = () : FirebaseFirestore.FieldValue => admin.firestore.FieldValue.serverTimestamp();

const ExecDeleteBatch = async (query : FirebaseFirestore.Query<FirebaseFirestore.DocumentData>) : Promise<void> =>
{
    let end : boolean = false;

    while (!end)
    {
        const batch = db.batch();

        // No need to offset the query as at every loop the previous batch has already been deleted from the db
        const querySnapshot = await query.limit(500 /* Firestore batched write limit */).get();

        querySnapshot.docs.forEach(doc => batch.delete(doc.ref));

        await batch.commit();

        end = querySnapshot.empty;
    }
}

const ExecUpdateBatch = async (query : FirebaseFirestore.Query<FirebaseFirestore.DocumentData>, data : FirebaseFirestore.UpdateData) : Promise<void> =>
{
    let end : boolean = false;
    let lastDoc : FirebaseFirestore.QueryDocumentSnapshot<FirebaseFirestore.DocumentData> | undefined;

    // Use always the created field as for now this method is only used to update user content documents
    // Using this field should also prevent missing documents if the user uploads new files while this function is running
    let newQuery = query.orderBy("created").limit(500);

    while (!end)
    {
        const batch = db.batch();

        if (lastDoc) newQuery = newQuery.startAfter(lastDoc);

        const querySnapshot = await newQuery.get();

        const docs = querySnapshot.docs;

        docs.forEach(doc => batch.update(doc.ref, data));

        await batch.commit();

        lastDoc = docs.pop();

        end = querySnapshot.empty;
    }
}

export const userCreated = functions.region(FUNCTIONS_REGION).auth.user().onCreate(async user =>
{
    await db.collection("users").doc(user.uid).set({
        created: GetCurrentTimestamp(),
        usedStorage: 0,
        maxStorage: FREE_STORAGE,
        plan: "free"
    });

    await CreateCustomer(user.uid, <string>user.email);
});

export const userDeleted = functions.region(FUNCTIONS_REGION).auth.user().onDelete(async user =>
{
    const userId : string = user.uid;

    await ExecDeleteBatch(db.collection(`users/${userId}/folders`).where("parentId", "==", "root"));
    await ExecDeleteBatch(db.collection(`users/${userId}/files`).where("parentId", "==", "root"));

    await db.collection(`users/${userId}/config`).doc("preferences").delete();

    await DeleteVault(userId);

    const userDoc = await db.collection("users").doc(userId).get();

    const customerId : string | undefined = (<FirebaseFirestore.DocumentData>userDoc.data()).stripe?.customerId;

    if (customerId) await stripe.customers.del(customerId);

    await userDoc.ref.delete();
});

export const signOutUserFromAllDevices = functions.region(FUNCTIONS_REGION).https.onCall(async (data, context) =>
{
    if (!context.auth) return;

    await admin.auth().revokeRefreshTokens(context.auth.uid);
});

export const fileUploaded = functions.region(FUNCTIONS_REGION).storage.object().onFinalize(async object =>
{
    const userId = (<string>object.name).split("/")[0];
    const fileId = (<string>object.name).split("/")[1];

    const size = parseInt(object.size);

    // Avoid continuing if the event is from a compressed folder being uploaded
    if (fileId.indexOf(".") > -1) return;

    const fileRef = db.collection(`users/${userId}/files`).doc(fileId);

    const userSnap = await db.collection("users").doc(userId).get();

    const fileSnap = await fileRef.get();

    const userData = <FirebaseFirestore.DocumentData>userSnap.data();

    if (!userSnap.exists || !fileSnap.exists || userData.usedStorage + size > userData.maxStorage) return fileRef.delete();

    return fileSnap.ref.update({ size });
});

export const fileUpdated = functions.region(FUNCTIONS_REGION).firestore.document("users/{userId}/files/{fileId}").onUpdate(async (change, context) =>
{
    const userId = context.params.userId;
    const fileId = context.params.fileId;

    const afterData = <FirebaseFirestore.DocumentData>change.after.data();
    const beforeData = <FirebaseFirestore.DocumentData>change.before.data();

    if (afterData.shared !== beforeData.shared || afterData.inVault !== beforeData.inVault)
        await storage.bucket().file(`${userId}/${fileId}`).setMetadata({
            metadata: {
                shared: `${afterData.shared}`,
                inVault: `${afterData.inVault}`
            }
        });

    if (afterData.trashed !== beforeData.trashed && afterData.trashed === false)
        if (afterData.parentId !== "root" && !(await db.collection(`users/${userId}/folders`).doc(afterData.parentId).get()).exists)
            await change.after.ref.update("parentId", "root");

    if (afterData.size !== beforeData.size)
        await db.collection("users").doc(userId)
            .update("usedStorage", admin.firestore.FieldValue.increment(afterData.size - (beforeData.size || 0)));
});

export const fileDeleted = functions.region(FUNCTIONS_REGION).firestore.document("users/{userId}/files/{fileId}").onDelete(async (doc, context) => {
    const userId = context.params.userId;
    const fileId = context.params.fileId;

    await storage.bucket().file(`${userId}/${fileId}`).delete();

    const size = (<FirebaseFirestore.DocumentData>doc.data()).size;

    const user = await db.collection("users").doc(userId).get();

    // Not executed if size is equal to 0 or if the file was deleted before adding its size because the storage space wasn't enough
    // Or if the user does not exist (file deleted as a consequence of deleting a user)
    if (user.exists && size) await user.ref.update("usedStorage", admin.firestore.FieldValue.increment(-size));
});

export const folderUpdated = functions.region(FUNCTIONS_REGION).firestore.document("users/{userId}/folders/{folderId}").onUpdate(async (change, context) =>
{
    const userId = context.params.userId;
    const folderId = context.params.folderId;

    const afterData = <FirebaseFirestore.DocumentData>change.after.data();
    const beforeData = <FirebaseFirestore.DocumentData>change.before.data();

    const inVault = afterData.inVault;

    if (inVault !== beforeData.inVault)
    {
        await ExecUpdateBatch(db.collection(`users/${userId}/folders`).where("parentId", "==", folderId), { inVault });
        await ExecUpdateBatch(db.collection(`users/${userId}/files`).where("parentId", "==", folderId), { inVault });
    }
});

export const folderDeleted = functions.region(FUNCTIONS_REGION).firestore.document("users/{userId}/folders/{folderId}").onDelete(async (snapshot, context) =>
{
    const userId = context.params.userId;
    const folderId = context.params.folderId;

    await ExecDeleteBatch(db.collection(`users/${userId}/folders`).where("parentId", "==", folderId).where("trashed", "==", false));
    await ExecDeleteBatch(db.collection(`users/${userId}/files`).where("parentId", "==", folderId).where("trashed", "==", false));

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
});

export const shareFolder = functions.region(FUNCTIONS_REGION).https.onCall(async (data, context) =>
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

export const createFolderArchive = functions.region(FUNCTIONS_REGION).runWith({
    memory: "2GB",
    timeoutSeconds: 540
}).https.onCall(async (data, context) =>
{
    if (!data.userId || !data.id || !data.format) return;

    const timestamp = Date.now();
    
    await CreateFolderArchive(data.userId, data.id, context.auth !== undefined, data.format, timestamp);

    return { timestamp };
});

export const emptyTrash = functions.region(FUNCTIONS_REGION).https.onCall(async (data, context) =>
{
    if (!context.auth) return;

    const userId : string = context.auth.uid;

    await ExecDeleteBatch(db.collection(`users/${userId}/folders`).where("trashed", "==", true));
    await ExecDeleteBatch(db.collection(`users/${userId}/files`).where("trashed", "==", true));
});

export const saveToMyAccount = functions.region(FUNCTIONS_REGION).https.onCall(async (data, context) =>
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
export const createVault = functions.region(FUNCTIONS_REGION).runWith({ memory: "2GB" }).https.onCall(async (data, context) =>
{
    if (!context.auth || !data.pin) return;

    const userId : string = context.auth.uid;
    const pin : string = data.pin;

    const success : boolean = IsValidVaultPin(pin);

    if (success)
    {
        await db.collection(`users/${userId}/vault`).doc("config").set({ pin: await bcrypt.hash(pin, 15) });
    
        await db.collection(`users/${userId}/vault`).doc("status").set({ locked: false });

        await auth.setCustomUserClaims(userId, { vaultLocked: false });
    }

    return { success };
});

export const lockVault = functions.region(FUNCTIONS_REGION).https.onCall(async (data, context) =>
{
    if (!context.auth) return;

    const userId : string = context.auth.uid;

    await db.collection(`users/${userId}/vault`).doc("status").update("locked", true);

    await auth.setCustomUserClaims(userId, { vaultLocked: true });
});

export const unlockVault = functions.region(FUNCTIONS_REGION).runWith({ memory: "2GB" }).https.onCall(async (data, context) =>
{
    if (!context.auth || !data.pin) return;

    const userId : string = context.auth.uid;
    const pin : string = data.pin;

    const success : boolean = await IsCorrectVaultPin(pin, userId);

    if (success)
    {
        await db.collection(`users/${userId}/vault`).doc("status").update("locked", false);

        await auth.setCustomUserClaims(userId, { vaultLocked: false });
    }

    return { success };
});

export const changeVaultPin = functions.region(FUNCTIONS_REGION).runWith({ memory: "2GB" }).https.onCall(async (data, context) =>
{
    if (!context.auth || !data.currentPin || !data.newPin) return;

    const userId : string = context.auth.uid;
    const currentPin : string = data.currentPin;
    const newPin : string = data.newPin;

    const vaultConfig = await db.collection(`users/${userId}/vault`).doc("config").get();

    const success : boolean = (await IsCorrectVaultPin(currentPin, userId)) && IsValidVaultPin(newPin);

    if (success) await vaultConfig.ref.set({ pin: await bcrypt.hash(newPin, 15) });

    return { success };
});

export const deleteVault = functions.region(FUNCTIONS_REGION).runWith({ memory: "2GB" }).https.onCall(async (data, context) =>
{
    if (!context.auth || !data.pin) return;

    const userId : string = context.auth.uid;
    const pin : string = data.pin;

    const success : boolean = await IsCorrectVaultPin(pin, userId);

    if (success) await DeleteVault(userId);

    return { success };
});

export const createSubscription = functions.region(FUNCTIONS_REGION).https.onCall(async (data, context) =>
{
    if (!context.auth || !data.plan || !data.currency) return;

    if (![ "free", "starter", "advanced" ].includes(data.plan)) return;

    if (![ "USD", "EUR" ].includes(data.currency)) return;

    const userId : string = context.auth.uid;

    const user = await db.collection("users").doc(userId).get();

    let customer : Stripe.Customer;

    if (!(<FirebaseFirestore.DocumentData>user.data()).stripe?.customerId)
    {
        if (!data.paymentMethod) return;

        const paymentMethod = await stripe.paymentMethods.retrieve(data.paymentMethod);

        customer = await CreateCustomer(userId, <string>context.auth.token.email, paymentMethod);
    }
    else customer = <Stripe.Customer>await stripe.customers.retrieve((<FirebaseFirestore.DocumentData>user.data()).stripe.customerId);

    if (!customer.invoice_settings.default_payment_method)
    {
        if (!data.paymentMethod) return;

        const paymentMethod = await stripe.paymentMethods.retrieve(data.paymentMethod);

        await AddPaymentMethod(userId, <string>context.auth.token.email, paymentMethod);
    }

    const planId : string = GetStripePlanId(data.plan, data.currency);

    if (data.plan !== "free")
    {
        const CreateSubscription = async () =>
        {
            const subscription = await stripe.subscriptions.create({
                customer: customer.id,
                items: [ { plan: planId } ]
            });

            await user.ref.update({
                "stripe.subscriptionId": subscription.id,
                "stripe.invoiceUrl": "" // Reset it because if the user has an incomplete subscription because of 3D Secure verification a new one is created
            });
        }

        // The user currently does not have a subscription
        if (!(<FirebaseFirestore.DocumentData>user.data()).stripe?.subscriptionId) await CreateSubscription();
        else
        {
            const subscription = await stripe.subscriptions.retrieve((<FirebaseFirestore.DocumentData>user.data()).stripe.subscriptionId);

            if (subscription.status === "incomplete") await CreateSubscription();
            else
            {
                const isUpgrade = IsPlanUpgrade((<FirebaseFirestore.DocumentData>user.data()).plan, data.plan);

                await stripe.subscriptions.update(subscription.id, {
                    // Upgrade the plan immediately if this is an upgrade, otherwise downgrade at the current period end
                    billing_cycle_anchor: isUpgrade ? "now" : "unchanged",
                    proration_behavior: isUpgrade ? "always_invoice" : "none",
                    cancel_at_period_end: false,
                    items: [ { id: subscription.items.data[0].id, plan: planId } ] // Setting the id prevents the new plan from being added to the subscription (the new plan replaces the old one)
                });
            }
        }

        await user.ref.update("stripe.cancelAtPeriodEnd", false);
    }
    else await CancelSubscription(userId); // The new selected plan is the free one

    await user.ref.update("stripe.currency", data.currency);
});

const IsPlanUpgrade = (oldPlan : string, newPlan : string) : boolean =>
{
    const GetPlanIndex = (plan : string) : number =>
    {
        switch (plan)
        {
            case "starter": return 1;
            case "advanced": return 2;
            default: return 0; // free plan
        }
    }

    return GetPlanIndex(newPlan) > GetPlanIndex(oldPlan);
}

export const cancelSubscription = functions.region(FUNCTIONS_REGION).https.onCall(async (data, context) =>
{
    if (!context.auth) return;

    await CancelSubscription(context.auth.uid);
});

export const addPaymentMethod = functions.region(FUNCTIONS_REGION).https.onCall(async (data, context) =>
{
    if (!context.auth || !data.paymentMethod) return;

    const paymentMethod = await stripe.paymentMethods.retrieve(data.paymentMethod);

    await AddPaymentMethod(context.auth.uid, <string>context.auth.token.email, paymentMethod);
});

export const deletePaymentMethod = functions.region(FUNCTIONS_REGION).https.onCall(async (data, context) =>
{
    if (!context.auth || !data.paymentMethod) return;

    const user = await db.collection("users").doc(context.auth.uid).get();

    const customer : Stripe.Customer = <Stripe.Customer>await stripe.customers.retrieve((<FirebaseFirestore.DocumentData>user.data()).stripe.customerId);

    // Cannot delete the default payment method if a subscription is active
    if ((customer.subscriptions?.data || []).length > 0 && customer.invoice_settings.default_payment_method === data.paymentMethod) return;

    await stripe.paymentMethods.detach(data.paymentMethod);
});

export const setDefaultPaymentMethod = functions.region(FUNCTIONS_REGION).https.onCall(async (data, context) =>
{
    if (!context.auth || !data.paymentMethod) return;

    const user = await db.collection("users").doc(context.auth.uid).get();

    await stripe.customers.update((<FirebaseFirestore.DocumentData>user.data()).stripe.customerId, { invoice_settings: { default_payment_method: data.paymentMethod } });
});

export const reactivateSubscription = functions.region(FUNCTIONS_REGION).https.onCall(async (data, context) =>
{
    if (!context.auth) return;

    const user = await db.collection("users").doc(context.auth.uid).get();

    await stripe.subscriptions.update((<FirebaseFirestore.DocumentData>user.data()).stripe.subscriptionId, { cancel_at_period_end: false });
});

export const stripeWebhooks = functions.region(FUNCTIONS_REGION).https.onRequest(async (request, response) =>
{
    let event;

    const signature : string = <string>request.headers["stripe-signature"];
  
    try { event = stripe.webhooks.constructEvent(request.rawBody, signature, STRIPE_WEBHOOK_SECRET); }
    catch (err)
    {
        response.status(400).send(`Webhook Error: ${err.message}`);

        return;
    }

    let user : FirebaseFirestore.DocumentSnapshot<FirebaseFirestore.DocumentData> | undefined;
    let subscription : Stripe.Subscription;
    let paymentMethod : Stripe.PaymentMethod;

    switch (event.type)
    {
        case "customer.subscription.deleted":
        case "invoice.payment_failed":
            if (event.type.startsWith("customer.subscription.")) subscription = <Stripe.Subscription>event.data.object;
            else subscription = await stripe.subscriptions.retrieve(<string>(<Stripe.Invoice>event.data.object).subscription);

            user = await GetUserByCustomerId(<string>subscription.customer);

            if (!user) break;

            if (event.type === "customer.subscription.deleted") await user.ref.update("stripe.subscriptionId", "");
            else if (event.type === "invoice.payment_failed" && (<Stripe.Invoice>event.data.object).billing_reason === "subscription_update")
            {
                await user.ref.update({
                    "stripe.invoiceUrl": (<Stripe.Invoice>event.data.object).hosted_invoice_url,
                    "stripe.nextPeriodPlan": ""
                });

                break;
            }

            await user.ref.update({
                "stripe.nextRenewal": "",
                "stripe.cancelAtPeriodEnd": false,
                "stripe.nextPeriodPlan": "",
                plan: "free",
                maxStorage: FREE_STORAGE
            });
        break;
        case "customer.subscription.updated":
            subscription = <Stripe.Subscription>event.data.object;

            user = await GetUserByCustomerId(<string>subscription.customer);

            await user?.ref.update("stripe.invoiceUrl", "");

            if (subscription.ended_at) break; // Do not update the user if the subscription has ended

            await user?.ref.update({
                "stripe.cancelAtPeriodEnd": subscription.cancel_at_period_end,
                "stripe.nextPeriodPlan": subscription.items.data[0].plan.metadata.plan
            });
        break;
        case "invoice.payment_succeeded":
            subscription = await stripe.subscriptions.retrieve(<string>(<Stripe.Invoice>event.data.object).subscription);

            const plan : string = subscription.items.data[0].plan.metadata.plan;
            let maxStorage : number = FREE_STORAGE;

            switch (plan)
            {
                case "starter": maxStorage = STARTER_STORAGE; break;
                case "advanced": maxStorage = ADVANCED_STORAGE; break;
            }

            if (subscription.ended_at) break; // Do not update the user if the subscription has ended

            await (await GetUserByCustomerId(<string>subscription.customer))?.ref.update({
                "stripe.nextRenewal": subscription.current_period_end,
                "stripe.invoiceUrl": "",
                plan,
                maxStorage
            });
        break;
        case "payment_method.attached":
            paymentMethod = <Stripe.PaymentMethod>event.data.object;

            await (await GetUserByCustomerId(<string>paymentMethod.customer))?.ref.update({
                "stripe.paymentMethods": admin.firestore.FieldValue.arrayUnion({
                    id: paymentMethod.id,
                    last4: paymentMethod.card?.last4,
                    brand: paymentMethod.card?.brand,
                    expirationMonth: paymentMethod.card?.exp_month,
                    expirationYear: paymentMethod.card?.exp_year,
                }),
            });
        break;
        case "payment_method.detached":
            paymentMethod = <Stripe.PaymentMethod>event.data.object;

            // The payment method is no longer attached to the customer so the customer id is in the previous_attributes object
            await (await GetUserByCustomerId(<string>(<any>event.data.previous_attributes)?.customer))?.ref.update({
                "stripe.paymentMethods": admin.firestore.FieldValue.arrayRemove({
                    id: paymentMethod.id,
                    last4: paymentMethod.card?.last4,
                    brand: paymentMethod.card?.brand,
                    expirationMonth: paymentMethod.card?.exp_month,
                    expirationYear: paymentMethod.card?.exp_year,
                }),
            });
        break;
        case "payment_method.card_automatically_updated":
            paymentMethod = <Stripe.PaymentMethod>event.data.object;

            // TODO
        break;
        case "customer.updated":
            const customer : Stripe.Customer = <Stripe.Customer>event.data.object;

            await (await GetUserByCustomerId(customer.id))?.ref.update("stripe.defaultPaymentMethod", <string>customer.invoice_settings.default_payment_method);
        break;
        case "invoice.payment_action_required":
            const invoice : Stripe.Invoice = <Stripe.Invoice>event.data.object;

            await (await GetUserByCustomerId(<string>invoice.customer))?.ref.update("stripe.invoiceUrl", invoice.hosted_invoice_url);
        break;
        default:
            response.status(400).end();

            return;
    }

    response.json({ received: true }).end();
});

const GetUserByCustomerId = async (customerId : string) : Promise<FirebaseFirestore.DocumentSnapshot<FirebaseFirestore.DocumentData> | undefined> =>
{
    const user = await db
        .collection("users")
        .where("stripe.customerId", "==", customerId)
        .limit(1)
        .get();

    return user.docs[0];
}

const GetStripePlanId = (plan : "free" | "starter" | "advanced", currency: "USD" | "EUR") : string =>
{
    let planId : string = "";

    switch (plan)
    {
        case "starter":
            switch (currency)
            {
                case "USD": planId = "plan_HGwqK8dcnqFKJf"; break;
                case "EUR": planId = "plan_HGwqTN4yc8fUex"; break;
            }
        break;
        case "advanced":
            switch (currency)
            {
                case "USD": planId = "plan_HIHxwVJ9kdvvga"; break;
                case "EUR": planId = "plan_HIHxfRgWsdkUkv"; break;
            }
        break;
    }

    return planId;
}

const AddPaymentMethod = async (userId : string, userEmail : string, paymentMethod : Stripe.PaymentMethod) =>
{
    const user = await db.collection("users").doc(userId).get();

    const customerId = (<FirebaseFirestore.DocumentData>user.data()).stripe?.customerId;

    if (!customerId) await CreateCustomer(userId, userEmail, paymentMethod);
    else
    {
        await stripe.paymentMethods.attach(paymentMethod.id, { customer: customerId });

        await stripe.customers.update(customerId, { invoice_settings: { default_payment_method: paymentMethod.id } });
    }
}

const CreateCustomer = async (userId : string, userEmail : string, paymentMethod ?: Stripe.PaymentMethod) : Promise<Stripe.Customer> =>
{
    const customer = await stripe.customers.create({ email: userEmail });

    await db.collection("users").doc(userId).update("stripe.customerId", customer.id);

    if (paymentMethod) await AddPaymentMethod(userId, userEmail, paymentMethod);

    return customer;
}

const CancelSubscription = async (userId : string) =>
{
    const user = await db.collection("users").doc(userId).get();

    await stripe.subscriptions.update((<FirebaseFirestore.DocumentData>user.data()).stripe.subscriptionId, { cancel_at_period_end: true });
}

const IsValidVaultPin = (pin : string) => typeof(pin) === "string" && pin?.length >= 4;

const IsCorrectVaultPin = async (pin : string, userId : string) : Promise<boolean> =>
{
    const vaultConfig = await db.collection(`users/${userId}/vault`).doc("config").get();

    return <boolean>(await bcrypt.compare(pin, (<FirebaseFirestore.DocumentData>vaultConfig.data()).pin));
}

const DeleteVault = async (userId : string) =>
{
    await ExecDeleteBatch(db.collection(`users/${userId}/folders`).where("parentId", "==", "vault"));
    await ExecDeleteBatch(db.collection(`users/${userId}/files`).where("parentId", "==", "vault"));

    await db.collection(`users/${userId}/vault`).doc("config").delete();
    await db.collection(`users/${userId}/vault`).doc("status").delete();
}

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

const CreateFolderArchive = async (userId : string, folderId : string, isUserAuthenticated : boolean, format : string, outputTimestamp : number) : Promise<void> => new Promise(async (resolve, reject) =>
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
        
    const output = fs.createWriteStream(path.join(tmpPath, `${folderId}.${format}`));

    const archiverOptions = format === "zip" ? { zlib: { level: 9 } } : (format === "tar.gz" ? { gzip: true, gzipOptions: { level: 1 } } : {})
        
    const archive = archiver(format === "zip" ? "zip" : "tar", archiverOptions);
        
    output.on("close", async () =>
    {
        await storage.bucket().upload(path.join(tmpPath, `${folderId}.${format}`), {
            destination: `${userId}/${folderId}.${outputTimestamp}.${format}`,
            metadata: { /* Custom metadata */ metadata: { shared: `${folderData.shared}`, inVault: `${folderData.inVault}` } }
        });

        await fs.remove(tmpPath); // Remove tmp content so that even if this function instance is used for multiple times no unnecessary files are kept

        resolve();
    });

    archive.on("warning", (err : Error) => reject(err));
            
    archive.on("error", (err : Error) => reject(err));
            
    archive.pipe(output);
        
    const AddFilesToArchive = (parentFolderId : string, folderPath : string) => new Promise(async (addFilesResolve, addFilesReject) =>
    {
        const RetrieveFiles = () => new Promise(async archiveResolve =>
        {
            const files = await db.collection(`users/${userId}/files`).where("parentId", "==", parentFolderId).get();

            for (const file of files.docs)
            {
                const fileName = file.data().name;
                
                const fileTmpPath = path.join(tmpPath, fileName);
                const filePath = path.join(folderPath, fileName);
                
                await storage.bucket().file(`${userId}/${file.id}`).download({ destination: fileTmpPath });
                
                archive.file(fileTmpPath, { name: filePath });
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