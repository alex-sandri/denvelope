const fs = require("fs");
const path = require("path");
const handlebars = require("handlebars");
const glob = require("glob");

handlebars.registerPartial("advanced", handlebars.compile(fs.readFileSync(path.join(__dirname + "/../views/settings/advanced.hbs")).toString("utf-8")));
handlebars.registerPartial("contextmenu", handlebars.compile(fs.readFileSync(path.join(__dirname + "/../views/contextmenu.hbs")).toString("utf-8")));
handlebars.registerPartial("defaulttags", handlebars.compile(fs.readFileSync(path.join(__dirname + "/../views/defaulttags.hbs")).toString("utf-8")));
handlebars.registerPartial("editor", handlebars.compile(fs.readFileSync(path.join(__dirname + "/../views/editor.hbs")).toString("utf-8")));
handlebars.registerPartial("firebase", handlebars.compile(fs.readFileSync(path.join(__dirname + "/../views/firebase.hbs")).toString("utf-8")));
handlebars.registerPartial("footer", handlebars.compile(fs.readFileSync(path.join(__dirname + "/../views/footer.hbs")).toString("utf-8")));
handlebars.registerPartial("general", handlebars.compile(fs.readFileSync(path.join(__dirname + "/../views/settings/general.hbs")).toString("utf-8")));
handlebars.registerPartial("header", handlebars.compile(fs.readFileSync(path.join(__dirname + "/../views/header.hbs")).toString("utf-8")));
handlebars.registerPartial("info", handlebars.compile(fs.readFileSync(path.join(__dirname + "/../views/settings/info.hbs")).toString("utf-8")));
handlebars.registerPartial("modal", handlebars.compile(fs.readFileSync(path.join(__dirname + "/../views/modal.hbs")).toString("utf-8")));
handlebars.registerPartial("plan", handlebars.compile(fs.readFileSync(path.join(__dirname + "/../views/settings/plan.hbs")).toString("utf-8")));
handlebars.registerPartial("privacy", handlebars.compile(fs.readFileSync(path.join(__dirname + "/../views/settings/privacy.hbs")).toString("utf-8")));
handlebars.registerPartial("security", handlebars.compile(fs.readFileSync(path.join(__dirname + "/../views/settings/security.hbs")).toString("utf-8")));
handlebars.registerPartial("spinner", handlebars.compile(fs.readFileSync(path.join(__dirname + "/../views/spinner.hbs")).toString("utf-8")));

const CssFileName = glob.sync("../../public/assets/css/bundle.*.css")[0].split("/").pop();

const homeJsFileName = glob.sync("../../public/assets/js/home.*.js")[0].split("/").pop();
const accountJsFileName =  glob.sync("../../public/assets/js/account.*.js")[0].split("/").pop();
const settingsJsFileName = glob.sync("../../public/assets/js/settings.*.js")[0].split("/").pop();

fs.writeFileSync("../../public/index.html", handlebars.compile(fs.readFileSync("../views/home.hbs", "utf8"))({
    cssversion: CssFileName,
    jsversion: homeJsFileName,
    year: new Date().getFullYear(),
    logoRedirectPath: "/",
}));

fs.writeFileSync("../../public/account.html", handlebars.compile(fs.readFileSync("../views/account.hbs", "utf8"))({
    cssversion: CssFileName,
    jsversion: accountJsFileName,
    logoRedirectPath: "/account",
}));

fs.writeFileSync("../../public/settings.html", handlebars.compile(fs.readFileSync("../views/settings.hbs", "utf8"))({
    cssversion: CssFileName,
    jsversion: settingsJsFileName,
    logoRedirectPath: "/account",
}));

fs.writeFileSync("../../public/plans.html", handlebars.compile(fs.readFileSync("../views/plans.hbs", "utf8"))({
    cssversion: CssFileName,
    jsversion: homeJsFileName,
    year: new Date().getFullYear(),
    logoRedirectPath: "/",
}));

fs.writeFileSync("../../public/terms.html", handlebars.compile(fs.readFileSync("../views/terms.hbs", "utf8"))({
    cssversion: CssFileName,
    jsversion: homeJsFileName,
    year: new Date().getFullYear(),
    logoRedirectPath: "/",
}));

fs.writeFileSync("../../public/privacy.html", handlebars.compile(fs.readFileSync("../views/privacy.hbs", "utf8"))({
    cssversion: CssFileName,
    jsversion: homeJsFileName,
    year: new Date().getFullYear(),
    logoRedirectPath: "/",
}));

fs.writeFileSync("../../public/cookies.html", handlebars.compile(fs.readFileSync("../views/cookies.hbs", "utf8"))({
    cssversion: CssFileName,
    jsversion: homeJsFileName,
    year: new Date().getFullYear(),
    logoRedirectPath: "/",
}));

fs.writeFileSync("../../public/accessibility.html", handlebars.compile(fs.readFileSync("../views/accessibility.hbs", "utf8"))({
    cssversion: CssFileName,
    jsversion: homeJsFileName,
    year: new Date().getFullYear(),
    logoRedirectPath: "/",
}));

fs.writeFileSync("../../public/404.html", handlebars.compile(fs.readFileSync("../views/404.hbs", "utf8"))({
    cssversion: CssFileName,
    jsversion: homeJsFileName,
    year: new Date().getFullYear(),
    logoRedirectPath: "/",
}));