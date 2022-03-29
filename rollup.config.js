import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import filesize from 'rollup-plugin-filesize';
import commonjs from 'rollup-plugin-commonjs';
import progress from 'rollup-plugin-progress';
import json from '@rollup/plugin-json';
import pkg from './package.json';
import { terser } from 'rollup-plugin-terser';
import { version } from './package.json';
import { nodeResolve } from '@rollup/plugin-node-resolve';


const inputPath = './src';
const outputPath = './dist';

const banner = `/*!
 * Mojo Perception JS API v${version}
 * https://mojo.ai
 *
 * Copyright (C) 2022 Hoomano SAS (@HoomanoCompany)
 * https://hoomano.com
 *
 * Date: ${new Date().toUTCString()}
 *
 */
`;

const jsPlugins = [
  json(),
  resolve(),
  progress(),
  filesize({
    showGzippedSize: true,
  }),
  babel({
    exclude: 'node_modules/**'
  }),
  commonjs(),
];


export default [
  {
    input: `${inputPath}/index.js`,
    output: {
      file: `${outputPath}/${pkg.main}`,
      format: 'umd',
      banner,
      name: 'mojo-perception'
    },
    plugins: jsPlugins,
  },
  {
    input: `${inputPath}/index.js`,
    output: {
      file: `${outputPath}/minified/${pkg.main.replace(/\.js$/, '.min.js')}`,
      banner,
      format: 'umd',
      name: 'mojo-perception'
    },
    plugins: [
      ...jsPlugins,
      terser()
    ]
  }
];
