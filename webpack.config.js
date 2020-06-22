const path = require("path");

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
                    include: path.resolve(__dirname, "src/ts"),
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
                    include: path.resolve(__dirname, "src/scss"),
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
    }
];