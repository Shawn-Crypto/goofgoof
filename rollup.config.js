import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import replace from '@rollup/plugin-replace';
import { analyzer } from 'rollup-plugin-analyzer';

const isProduction = process.env.NODE_ENV === 'production';

export default [
  {
    // Main bundle - critical scripts
    input: 'src/js/main.js',
    output: {
      file: 'dist/js/bundle.js',
      format: 'iife',
      name: 'App',
      sourcemap: !isProduction
    },
    plugins: [
      nodeResolve({
        browser: true,
        preferBuiltins: false
      }),
      commonjs(),
      replace({
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
        preventAssignment: true
      }),
      isProduction && terser({
        compress: {
          drop_console: true,
          drop_debugger: true,
          pure_funcs: ['console.log', 'console.warn']
        },
        mangle: {
          reserved: ['toggleNav', 'toggleAccordion', 'toggleFAQ', 'closeBanner']
        }
      }),
      analyzer({
        summaryOnly: true,
        limit: 10
      })
    ].filter(Boolean)
  },
  {
    // FAQ module - lazy loaded
    input: 'src/js/modules/faq.js',
    output: {
      file: 'dist/js/faq.js',
      format: 'iife',
      name: 'FAQ',
      sourcemap: !isProduction
    },
    plugins: [
      nodeResolve({
        browser: true,
        preferBuiltins: false
      }),
      commonjs(),
      isProduction && terser({
        compress: {
          drop_console: true,
          drop_debugger: true
        }
      })
    ].filter(Boolean)
  },
  {
    // Analytics module - lazy loaded
    input: 'src/js/modules/analytics.js',
    output: {
      file: 'dist/js/analytics.js',
      format: 'iife',
      name: 'Analytics',
      sourcemap: !isProduction
    },
    plugins: [
      nodeResolve({
        browser: true,
        preferBuiltins: false
      }),
      commonjs(),
      isProduction && terser({
        compress: {
          drop_console: true,
          drop_debugger: true
        }
      })
    ].filter(Boolean)
  }
];
