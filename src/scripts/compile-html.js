const assets = require("../ts/config/assets.json");

const fs = require("fs");
const path = require("path");
const handlebars = require("handlebars");
const glob = require("glob");

const PUBLIC_PATH = path.join(__dirname, "..", "..", "public");
const ASSETS_PATH = path.join(PUBLIC_PATH, "assets");
const VIEWS_PATH = path.join(__dirname, "..", "views");

handlebars.registerPartial("advanced", handlebars.compile(fs.readFileSync(path.join(VIEWS_PATH, "settings", "advanced.hbs")).toString("utf-8")));
handlebars.registerPartial("contextmenu", handlebars.compile(fs.readFileSync(path.join(VIEWS_PATH, "contextmenu.hbs")).toString("utf-8")));
handlebars.registerPartial("defaulttags", handlebars.compile(fs.readFileSync(path.join(VIEWS_PATH, "defaulttags.hbs")).toString("utf-8")));
handlebars.registerPartial("editor", handlebars.compile(fs.readFileSync(path.join(VIEWS_PATH, "editor.hbs")).toString("utf-8")));
handlebars.registerPartial("firebase", handlebars.compile(fs.readFileSync(path.join(VIEWS_PATH, "firebase.hbs")).toString("utf-8")));
handlebars.registerPartial("footer", handlebars.compile(fs.readFileSync(path.join(VIEWS_PATH, "footer.hbs")).toString("utf-8")));
handlebars.registerPartial("general", handlebars.compile(fs.readFileSync(path.join(VIEWS_PATH, "settings", "general.hbs")).toString("utf-8")));
handlebars.registerPartial("header", handlebars.compile(fs.readFileSync(path.join(VIEWS_PATH, "header.hbs")).toString("utf-8")));
handlebars.registerPartial("info", handlebars.compile(fs.readFileSync(path.join(VIEWS_PATH, "settings", "info.hbs")).toString("utf-8")));
handlebars.registerPartial("languageselect", handlebars.compile(fs.readFileSync(path.join(VIEWS_PATH, "components", "language-select.hbs")).toString("utf-8")));
handlebars.registerPartial("modal", handlebars.compile(fs.readFileSync(path.join(VIEWS_PATH, "modal.hbs")).toString("utf-8")));
handlebars.registerPartial("plan", handlebars.compile(fs.readFileSync(path.join(VIEWS_PATH, "settings", "plan.hbs")).toString("utf-8")));
handlebars.registerPartial("plans", handlebars.compile(fs.readFileSync(path.join(VIEWS_PATH, "components", "plans.hbs")).toString("utf-8")));
handlebars.registerPartial("privacy", handlebars.compile(fs.readFileSync(path.join(VIEWS_PATH, "settings", "privacy.hbs")).toString("utf-8")));
handlebars.registerPartial("security", handlebars.compile(fs.readFileSync(path.join(VIEWS_PATH, "settings", "security.hbs")).toString("utf-8")));
handlebars.registerPartial("spinner", handlebars.compile(fs.readFileSync(path.join(VIEWS_PATH, "spinner.hbs")).toString("utf-8")));

const cssFileName = glob.sync(path.join(ASSETS_PATH, "css", "bundle.*.css"))[0].split("/").pop();

const homeJsFileName = glob.sync(path.join(ASSETS_PATH, "js", "home.*.js"))[0].split("/").pop();
const accountJsFileName =  glob.sync(path.join(ASSETS_PATH, "js", "account.*.js"))[0].split("/").pop();
const settingsJsFileName = glob.sync(path.join(ASSETS_PATH, "js", "settings.*.js"))[0].split("/").pop();

fs.writeFileSync(path.join(PUBLIC_PATH, "index.html"), handlebars.compile(fs.readFileSync(path.join(VIEWS_PATH, "home.hbs"), "utf8"))({
    cssversion: cssFileName,
    jsversion: homeJsFileName,
    year: new Date().getFullYear(),
    logoRedirectPath: "/",
}));

fs.writeFileSync(path.join(PUBLIC_PATH, "account.html"), handlebars.compile(fs.readFileSync(path.join(VIEWS_PATH, "account.hbs"), "utf8"))({
    cssversion: cssFileName,
    jsversion: accountJsFileName,
    logoRedirectPath: "/account",
}));

fs.writeFileSync(path.join(PUBLIC_PATH, "settings.html"), handlebars.compile(fs.readFileSync(path.join(VIEWS_PATH, "settings.hbs"), "utf8"))({
    cssversion: cssFileName,
    jsversion: settingsJsFileName,
    logoRedirectPath: "/account",
}));

fs.writeFileSync(path.join(PUBLIC_PATH, "plans.html"), handlebars.compile(fs.readFileSync(path.join(VIEWS_PATH, "plans.hbs"), "utf8"))({
    cssversion: cssFileName,
    jsversion: homeJsFileName,
    year: new Date().getFullYear(),
    logoRedirectPath: "/",
}));

fs.writeFileSync(path.join(PUBLIC_PATH, "terms.html"), handlebars.compile(fs.readFileSync(path.join(VIEWS_PATH, "terms.hbs"), "utf8"))({
    cssversion: cssFileName,
    jsversion: homeJsFileName,
    year: new Date().getFullYear(),
    logoRedirectPath: "/",
}));

fs.writeFileSync(path.join(PUBLIC_PATH, "privacy.html"), handlebars.compile(fs.readFileSync(path.join(VIEWS_PATH, "privacy.hbs"), "utf8"))({
    cssversion: cssFileName,
    jsversion: homeJsFileName,
    year: new Date().getFullYear(),
    logoRedirectPath: "/",
}));

fs.writeFileSync(path.join(PUBLIC_PATH, "cookies.html"), handlebars.compile(fs.readFileSync(path.join(VIEWS_PATH, "cookies.hbs"), "utf8"))({
    cssversion: cssFileName,
    jsversion: homeJsFileName,
    year: new Date().getFullYear(),
    logoRedirectPath: "/",
}));

fs.writeFileSync(path.join(PUBLIC_PATH, "accessibility.html"), handlebars.compile(fs.readFileSync(path.join(VIEWS_PATH, "accessibility.hbs"), "utf8"))({
    cssversion: cssFileName,
    jsversion: homeJsFileName,
    year: new Date().getFullYear(),
    logoRedirectPath: "/",
}));

fs.writeFileSync(path.join(PUBLIC_PATH, "404.html"), handlebars.compile(fs.readFileSync(path.join(VIEWS_PATH, "404.hbs"), "utf8"))({
    cssversion: cssFileName,
    jsversion: homeJsFileName,
    year: new Date().getFullYear(),
    logoRedirectPath: "/",
}));

const updatedAssets = assets;

updatedAssets.dynamic.css.bundle = cssFileName;
updatedAssets.dynamic.js.home = homeJsFileName;
updatedAssets.dynamic.js.account = accountJsFileName;
updatedAssets.dynamic.js.settings = settingsJsFileName;

fs.writeFileSync(path.join(__dirname, "..", "ts", "config", "assets.json"), JSON.stringify(updatedAssets, null, 4));