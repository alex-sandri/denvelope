export default {
	defaultIcon: { name: "folder" },
	rootFolder: { name: "folder-root" },
	icons: [
		{ name: "folder-src", folderNames: [ "src", "source", "sources" ] },
		{ name: "folder-dist", folderNames: [ "dist", "out", "build", "release", "bin" ] },
		{ name: "folder-css", folderNames: [ "css", "stylesheet", "stylesheets", "style", "styles" ] },
		{ name: "folder-sass", folderNames: [ "sass", "_sass", "scss", "_scss" ] },
		{ name: "folder-images", folderNames: [ "images", "image", "img", "icons", "icon", "ico", "screenshot", "screenshots" ] },
		{ name: "folder-scripts", folderNames: [ "script", "scripts" ] },
		{ name: "folder-node", folderNames: [ "node_modules" ] },
		{ name: "folder-javascript", folderNames: [ "js", "javascript", "javascripts" ] },
		{ name: "folder-json", folderNames: [ "json" ] },
		{ name: "folder-font", folderNames: [ "font", "fonts" ] },
		{ name: "folder-bower", folderNames: [ "bower_components" ] },
		{
			name: "folder-test",
			folderNames: [
				"test",
				"tests",
				"testing",
				"__tests__",
				"__snapshots__",
				"__mocks__",
				"__test__",
				"spec",
				"specs",
			],
		},
		{ name: "folder-jinja", folderNames: [ "jinja", "jinja2", "j2" ] },
		{ name: "folder-markdown", folderNames: [ "markdown", "md" ] },
		{ name: "folder-php", folderNames: [ "php" ] },
		{ name: "folder-phpmailer", folderNames: [ "phpmailer" ] },
		{ name: "folder-sublime", folderNames: [ "sublime" ] },
		{ name: "folder-docs", folderNames: [ "doc", "docs", "documents", "documentation", "post", "posts" ] },
		{
			name: "folder-git",
			folderNames: [ ".git", "githooks", ".githooks", "submodules", ".submodules" ],
		},
		{ name: "folder-github", folderNames: [ ".github" ] },
		{ name: "folder-gitlab", folderNames: [ ".gitlab" ] },
		{ name: "folder-vscode", folderNames: [ ".vscode", ".vscode-test" ] },
		{
			name: "folder-views",
			folderNames: [ "view", "views", "screen", "screens", "page", "pages", "html" ],
		},
		{ name: "folder-vue", folderNames: [ "vue" ] },
		{ name: "folder-expo", folderNames: [ ".expo", ".expo-shared" ] },
		{ name: "folder-config", folderNames: [ "config", "configs", "configuration", "configurations", "settings", ".settings", "META-INF" ] },
		{
			name: "folder-i18n",
			folderNames: [ "i18n", "internationalization", "lang", "language", "languages", "locale", "locales", "localization", "translation", "translate", "translations", ".tx" ],
		},
		{ name: "folder-components", folderNames: [ "components" ] },
		{ name: "folder-aurelia", folderNames: [ "aurelia_project" ] },
		{
			name: "folder-resource",
			folderNames: [ "resource", "resources", "res", "asset", "assets", "static" ],
		},
		{ name: "folder-lib", folderNames: [ "lib", "libs", "library", "libraries", "vendor", "vendors", "third-party" ] },
		{ name: "folder-theme", folderNames: [ "themes", "theme", "color", "colors", "design", "designs" ] },
		{ name: "folder-webpack", folderNames: [ "webpack", ".webpack" ] },
		{ name: "folder-global", folderNames: [ "global" ] },
		{ name: "folder-public", folderNames: [ "public", "wwwroot", "web", "website" ] },
		{ name: "folder-include", folderNames: [ "include", "includes", "_includes" ] },
		{ name: "folder-docker", folderNames: [ "docker", "dockerfiles", ".docker" ] },
		{ name: "folder-ngrx-effects", folderNames: [ "effects" ] },
		{ name: "folder-ngrx-store", folderNames: [ "store" ] },
		{ name: "folder-ngrx-state", folderNames: [ "states", "state" ] },
		{ name: "folder-ngrx-reducer", folderNames: [ "reducers", "reducer" ] },
		{ name: "folder-ngrx-actions", folderNames: [ "actions" ] },
		{ name: "folder-ngrx-entities", folderNames: [ "entities" ] },
		{ name: "folder-redux-reducer", folderNames: [ "reducers", "reducer" ] },
		{ name: "folder-redux-actions", folderNames: [ "actions" ] },
		{ name: "folder-redux-store", folderNames: [ "store" ] },
		{ name: "folder-react-components", folderNames: [ "components" ] },
		{ name: "folder-database", folderNames: [ "db", "database", "databases", "sql", "data", "_data" ] },
		{ name: "folder-log", folderNames: [ "log", "logs" ] },
		{ name: "folder-temp", folderNames: [ "temp", ".temp", "tmp", ".tmp", "cached", "cache", ".cache" ] },
		{ name: "folder-aws", folderNames: [ "aws", ".aws" ] },
		{ name: "folder-audio", folderNames: [ "audio", "audios", "music" ] },
		{ name: "folder-video", folderNames: [ "video", "videos", "movie", "movies" ] },
		{ name: "folder-kubernetes", folderNames: [ "kubernetes", "k8s" ] },
		{ name: "folder-import", folderNames: [ "import", "imports", "imported" ] },
		{ name: "folder-export", folderNames: [ "export", "exports", "exported" ] },
		{ name: "folder-wakatime", folderNames: [ "wakatime" ] },
		{ name: "folder-circleci", folderNames: [ ".circleci" ] },
		{ name: "folder-wordpress", folderNames: [ "wp-content" ] },
		{ name: "folder-gradle", folderNames: [ "gradle", ".gradle" ] },
		{ name: "folder-coverage", folderNames: [ "coverage", ".nyc-output", ".nyc_output", "e2e", "it", "integration-test", "integration-tests" ] },
		{ name: "folder-class", folderNames: [ "class", "classes", "model", "models" ] },
		{ name: "folder-other", folderNames: [ "other", "others", "misc", "miscellaneous", "extra", "extras" ] },
		{ name: "folder-typescript", folderNames: [ "typescript", "ts", "typings", "@types" ] },
		{ name: "folder-graphql", folderNames: [ "graphql", "gql" ] },
		{ name: "folder-routes", folderNames: [ "routes", "router" ] },
		{ name: "folder-ci", folderNames: [ ".ci", "ci" ] },
		{ name: "folder-benchmark", folderNames: [ "benchmark", "benchmarks", "performance", "measure", "measures", "measurement" ] },
		{ name: "folder-messages", folderNames: [ "messages", "forum", "chat", "chats", "conversation", "conversations" ] },
		{ name: "folder-less", folderNames: [ "less" ] },
		{ name: "folder-python", folderNames: [ "python", "__pycache__", ".pytest_cache" ] },
		{ name: "folder-debug", folderNames: [ "debug", "debugging" ] },
		{ name: "folder-fastlane", folderNames: [ "fastlane" ] },
		{ name: "folder-plugin", folderNames: [ "plugin", "plugins", "_plugins", "extension", "extensions", "addon", "addons" ] },
		{ name: "folder-middleware", folderNames: [ "middleware", "middlewares" ] },
		{ name: "folder-controller", folderNames: [ "controller", "controllers", "service", "services", "provider", "providers" ] },
		{ name: "folder-ansible", folderNames: [ "ansible" ] },
		{ name: "folder-server", folderNames: [ "server", "servers", "backend" ] },
		{ name: "folder-client", folderNames: [ "client", "clients", "frontend" ] },
		{ name: "folder-tasks", folderNames: [ "tasks", "tickets" ] },
		{ name: "folder-android", folderNames: [ "android" ] },
		{ name: "folder-ios", folderNames: [ "ios" ] },
		{ name: "folder-upload", folderNames: [ "uploads", "upload" ] },
		{ name: "folder-download", folderNames: [ "downloads", "download" ] },
		{ name: "folder-tools", folderNames: [ "tools" ] },
		{ name: "folder-helper", folderNames: [ "helpers", "helper" ] },
		{ name: "folder-serverless", folderNames: [ ".serverless", "serverless" ] },
		{ name: "folder-api", folderNames: [ "api", "apis" ] },
		{ name: "folder-app", folderNames: [ "app", "apps" ] },
		{ name: "folder-archive", folderNames: [ "archive", "archives", "archival", "backup", "backups", "back-up", "back-ups" ] },
		{ name: "folder-batch", folderNames: [ "batch", "batchs", "batches" ] },
		{ name: "folder-cluster", folderNames: [ "cluster", "clusters" ] },
		{ name: "folder-command", folderNames: [ "command", "commands", "cli", "clis" ] },
		{ name: "folder-constant", folderNames: [ "constant", "constants" ] },
		{ name: "folder-container", folderNames: [ "container", "containers" ] },
		{ name: "folder-content", folderNames: [ "content", "contents" ] },
		{ name: "folder-core", folderNames: [ "core" ] },
		{ name: "folder-delta", folderNames: [ "delta", "deltas", "changes" ] },
		{ name: "folder-dump", folderNames: [ "dump", "dumps" ] },
		{ name: "folder-examples", folderNames: [ "example", "examples", "sample", "samples", "demo", "demos" ] },
		{ name: "folder-environment", folderNames: [ ".env", ".environment", "env", "environment", "environments" ] },
		{ name: "folder-functions", folderNames: [ "function", "functions", "lambda", "lambdas" ] },
		{ name: "folder-generator", folderNames: [ "generator", "generators", "generated", "cfn-gen", "gen", "gens", "auto" ] },
		{ name: "folder-hook", folderNames: [ "hook", "hooks", "trigger", "triggers" ] },
		{ name: "folder-job", folderNames: [ "job", "jobs" ] },
		{ name: "folder-keys", folderNames: [ "keys", "key", "token", "tokens" ] },
		{ name: "folder-layout", folderNames: [ "layout", "layouts" ] },
		{ name: "folder-mail", folderNames: [ "mail", "mails", "smtp" ] },
		{ name: "folder-mappings", folderNames: [ "mappings", "mapping" ] },
		{ name: "folder-meta", folderNames: [ "meta" ] },
		{ name: "folder-packages", folderNames: [ "package", "packages" ] },
		{ name: "folder-shared", folderNames: [ "shared" ] },
		{ name: "folder-stack", folderNames: [ "stack", "stacks" ] },
		{ name: "folder-template", folderNames: [ "template", "templates" ] },
		{ name: "folder-utils", folderNames: [ "util", "utils" ] },
		{ name: "folder-private", folderNames: [ "private", ".private" ] },
		{ name: "folder-error", folderNames: [ "error", "errors", "err" ] },
		{ name: "folder-event", folderNames: [ "event", "events" ] },
		{ name: "folder-secure", folderNames: [ "auth", "authentication", "secure", "security", "cert", "certs", "certificate", "certificates", "ssl" ] },
		{ name: "folder-custom", folderNames: [ "custom", "customs" ] },
		{ name: "folder-mock", folderNames: [ "mock", "mocks", "draft", "drafts", "concept", "concepts", "sketch", "sketches" ] },
		{ name: "folder-syntax", folderNames: [ "syntax", "syntaxes", "spellcheck" ] },
		{ name: "folder-vm", folderNames: [ "vm", "vms" ] },
		{ name: "folder-stylus", folderNames: [ "stylus" ] },
		{ name: "folder-flow", folderNames: [ "flow-typed" ] },
		{ name: "folder-rules", folderNames: [ "rule", "rules", "validation", "validations", "validator", "validators" ] },
		{ name: "folder-review", folderNames: [ "review", "reviews", "revisal", "revisals", "reviewed" ] },
		{ name: "folder-animation", folderNames: [ "animation", "animations", "animated" ] },
		{ name: "folder-guard", folderNames: [ "guard", "guards" ] },
		{ name: "folder-prisma", folderNames: [ "prisma" ] },
		{ name: "folder-pipe", folderNames: [ "pipe", "pipes" ] },
		{ name: "folder-svg", folderNames: [ "svg", "svgs" ] },
		{ name: "folder-vuex-store", folderNames: [ "store" ] },
		{ name: "folder-nuxt", folderNames: [ "nuxt", ".nuxt" ] },
		{ name: "folder-vue-directives", folderNames: [ "directives" ] },
		{ name: "folder-vue", folderNames: [ "components" ] },
		{ name: "folder-mobile", folderNames: [ "mobile", "mobiles", "portable" ] },
	],
};