import path from "path";
import * as webpack from 'webpack';

const config: webpack.Configuration[] = [
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

export default config;