import path from 'node:path'
import htmlWebpackPlugin from 'html-webpack-plugin'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

/**
 * @type {import('webpack').Configuration}
 */
const __dirname = fileURLToPath(new URL('.', import.meta.url))
const require = createRequire(import.meta.url)

const config = {
  entry: './src/index.ts',
  output: {
    filename: 'bunch.js',
    path: path.resolve(__dirname, './dist'),
    clean: true,
  },
  devtool: 'source-map',
  mode: 'development',
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new htmlWebpackPlugin({
      template: './public/index.html',
    }),
  ],
  /**
   * @type { import('webpack-dev-server').Configuration}
   */
  devServer: {},
}

export default config
