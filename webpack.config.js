"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var path_1 = __importDefault(require("path"));
var fork_ts_checker_webpack_plugin_1 = __importDefault(require("fork-ts-checker-webpack-plugin"));
delete process.env.TS_NODE_PROJECT;
var config = [
    {
        entry: {
            index: "./src/ts/index.ts",
            account: "./src/ts/account.ts",
            settings: "./src/ts/settings.ts",
        },
        module: {
            rules: [
                {
                    test: /\.ts$/,
                    include: path_1.default.resolve(__dirname, "src/ts"),
                    loader: "ts-loader",
                    exclude: /node_modules/,
                    options: {
                        transpileOnly: true
                    }
                },
            ],
        },
        plugins: [new fork_ts_checker_webpack_plugin_1.default()],
        resolve: {
            extensions: [
                ".ts",
                ".js"
            ],
        },
        output: {
            filename: "[name].[contenthash].js",
            path: path_1.default.resolve(__dirname, "public/assets/js"),
        },
    },
    {
        entry: "./src/scss/main.scss",
        output: {
            // This is necessary for webpack to compile
            // But we never use style-bundle.js
            filename: "style-bundle.js",
            path: path_1.default.resolve(__dirname, "public/assets/css")
        },
        module: {
            rules: [
                {
                    test: /\.scss$/,
                    include: path_1.default.resolve(__dirname, "src/scss"),
                    use: [
                        {
                            loader: "file-loader",
                            options: {
                                name: "bundle.[contenthash].css"
                            },
                        },
                        {
                            loader: "extract-loader"
                        },
                        {
                            loader: "css-loader"
                        },
                        {
                            loader: "sass-loader",
                            options: {
                                sassOptions: {
                                    includePaths: [
                                        "./node_modules"
                                    ]
                                }
                            }
                        }
                    ]
                }
            ]
        },
    }
];
exports.default = config;
