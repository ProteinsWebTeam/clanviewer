/* eslint-env node */
module.exports = {
    env: {
        browser: true,
        es6: true,
    },
    parser: 'babel-eslint',
    extends: ['eslint:recommended'],
    parserOptions: {
        ecmaVersion: 2017,
        sourceType: 'module',
        ecmaFeatures: {
            jsx: true,
            modules: true,
        },
    },
    rules: {
        'no-empty': ['error', { allowEmptyCatch: true }],
    },
};