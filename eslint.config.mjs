import htmlConfig from '@genericmedia/config/eslint-html.config.mjs'
import tsconfig from '@genericmedia/config/eslint-ts.config.mjs'
import { defineConfig } from 'eslint/config'

export default defineConfig(
  tsconfig,
  htmlConfig,
)
