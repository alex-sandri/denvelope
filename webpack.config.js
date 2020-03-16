const path = require('path');
//const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = [
    {
        entry: {
            home: "./src/ts/home.ts",
            account: "./src/ts/account.ts",
            settings: "./src/ts/settings.ts",
        },
        module: {
            rules: [
                {
                    test: /\.ts$/,
                    loader: "ts-loader",
                    exclude: /node_modules/,
                },
            ],
        },
        resolve: {
            extensions: [
                ".ts",
                ".js"
            ],
        },
        output: {
            filename: "[name].[contenthash].js",
            path: path.resolve(__dirname, "public/assets/js"),
        },
        mode: "production",
    },
    {
        entry: "./src/scss/main.scss",
        output: {
            // This is necessary for webpack to compile
            // But we never use style-bundle.js
            filename: "style-bundle.js",
            path: path.resolve(__dirname, "public/assets/css")
        },
        module: {
            rules: [
                {
                    test: /\.scss$/,
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
        mode: "production"
    },
    /*
    {
        entry: {
            index: "./public/index.html",
            account: "./public/account.html",
            settings: "./public/settings.html",
            privacy: "./public/privacy.html",
        },
        module: {
            rules: [
                {
                    test: /\.html$/,
                    use: [
                        {
                            loader: "html-loader",
                            options: {
                                minimize: true
                            }
                        }
                    ]
                },
                {
                    test: /\.svg$/,
                    use: [
                        "file-loader"
                    ]
                }
            ]
        },
        plugins: [
            new HtmlWebpackPlugin({
                filename: "index.html",
                template: path.resolve(__dirname, "public/index.html")
            })
        ].concat(["account", "settings", "privacy"].map(entry => new HtmlWebpackPlugin({
            filename: `${entry}.html`,
            template: path.resolve(__dirname, `public/${entry}.html`)
        }))),
        mode: "production"
    }
    */
];