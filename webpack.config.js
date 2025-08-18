const path = require('path');

module.exports = {
    mode: 'development',
    entry: './frontend/src/index.js',
    output: {
        path: path.resolve(__dirname, 'frontend/public'),
        filename: 'bundle.js',
        publicPath: '/'
    },
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader'
                }
            }
        ]
    },
    resolve: {
        extensions: ['.js', '.jsx']
    },
    devServer: {
        static: {
            directory: path.join(__dirname, 'frontend/public')
        },
        port: 3000,
        historyApiFallback: true,
        hot: true
    }
};