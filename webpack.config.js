const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = (env, argv) => {
    const isProduction = argv.mode === 'production';
    
    return {
        entry: {
            main: './src/js/main.js',
            faq: './src/js/modules/faq.js',
            analytics: './src/js/modules/analytics.js'
        },
        
        output: {
            path: path.resolve(__dirname, 'dist/js'),
            filename: isProduction ? '[name].min.js' : '[name].js',
            chunkFilename: isProduction ? '[name].[contenthash].min.js' : '[name].js',
            clean: true
        },
        
        module: {
            rules: [
                {
                    test: /\.js$/,
                    exclude: /node_modules/,
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: [
                                ['@babel/preset-env', {
                                    targets: {
                                        browsers: ['> 1%', 'last 2 versions', 'not dead']
                                    },
                                    modules: false,
                                    useBuiltIns: 'usage',
                                    corejs: 3
                                }]
                            ]
                        }
                    }
                }
            ]
        },
        
        optimization: {
            minimize: isProduction,
            minimizer: [
                new TerserPlugin({
                    terserOptions: {
                        compress: {
                            drop_console: isProduction,
                            drop_debugger: isProduction,
                            pure_funcs: isProduction ? ['console.log', 'console.warn'] : []
                        },
                        mangle: {
                            reserved: ['toggleNav', 'toggleAccordion', 'toggleFAQ', 'closeBanner']
                        }
                    }
                })
            ],
            splitChunks: {
                chunks: 'all',
                cacheGroups: {
                    vendor: {
                        test: /[\\/]node_modules[\\/]/,
                        name: 'vendors',
                        chunks: 'all',
                        minChunks: 1
                    },
                    common: {
                        name: 'common',
                        minChunks: 2,
                        priority: -10,
                        reuseExistingChunk: true
                    }
                }
            }
        },
        
        resolve: {
            extensions: ['.js'],
            alias: {
                '@': path.resolve(__dirname, 'src'),
                '@modules': path.resolve(__dirname, 'src/js/modules')
            }
        },
        
        plugins: [
            ...(env.analyze ? [new BundleAnalyzerPlugin()] : [])
        ],
        
        devtool: isProduction ? 'source-map' : 'eval-source-map',
        
        stats: {
            colors: true,
            modules: false,
            children: false,
            chunks: false,
            chunkModules: false
        }
    };
};
