const path = require("path");

module.exports = [
    {
        entry: "./src/ts/sw/sw.ts",
        module: {
            rules: [
                {
                    test: /\.ts$/,
                    loader: "ts-loader",
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
            filename: "sw.js",
            path: path.resolve(__dirname, "public"),
        },
    }
];