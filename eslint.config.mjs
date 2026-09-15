import withNuxt from './.nuxt/eslint.config.mjs';

export default withNuxt({
  ignores: ['.nuxt/**', '.output/**', 'node_modules/**', 'coverage/**', '**/*.log', '**/*.dump', '**/*.bak', 'tmp/**'],
}, {
  // Existing code is reported incrementally; syntax and correctness rules stay enabled.
  rules: {
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }],
    '@typescript-eslint/no-explicit-any': 'warn',
    'vue/multi-word-component-names': 'off',
    'prefer-const': 'off',
    '@typescript-eslint/consistent-type-imports': 'off',
    'vue/valid-v-slot': ['error', { allowModifiers: true }],
    'vue/v-slot-style': 'off',
    'vue/attributes-order': 'off',
    'vue/html-self-closing': 'off',
    'vue/attribute-hyphenation': 'off',
    'vue/v-on-event-hyphenation': 'off',
  },
}, {
  files: ['server/database/**/*.ts', 'server/adapters/SqlAdapter.ts', 'server/utils/**/*.ts'],
  languageOptions: { parserOptions: { projectService: true } },
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-floating-promises': 'error',
    '@typescript-eslint/no-misused-promises': 'error',
    '@typescript-eslint/no-unused-vars': 'error',
  },
});
