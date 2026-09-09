import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

/*
 * The tests import the application modules by the same `@/` alias the app uses, so the alias has to
 * be declared twice: tsconfig.json teaches it to the compiler, this file teaches it to the runner.
 * Letting the tests use relative paths instead would have been one less file, but then a test would
 * exercise a different module specifier than the code under test.
 *
 * `environment: 'node'` because nothing here renders a component: every suite covers a pure
 * function or reads the filesystem. A DOM would only add startup time.
 */
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
