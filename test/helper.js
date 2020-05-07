const firebase = require("@firebase/testing");
const fs = require("fs");

module.exports.setup = async (auth, data) =>
{
    const projectId = `rules-test-${Date.now()}`;

    const app = await firebase.initializeTestApp({ projectId, auth });

    const db = app.firestore();

    if (data)
        for (const key in data)
            db.doc(key).set(data[key]);

    await firebase.loadFirestoreRules({ projectId, rules: fs.readFileSync("firestore.rules") });

    return db;
}

module.exports.teardown = async () => Promise.all(firebase.apps().map(app => app.delete()));