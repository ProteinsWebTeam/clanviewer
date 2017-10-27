/* eslint-env node */
module.exports = {
    env: {
        browser: true,
        es6: true,
        "jest/globals": true,
    },
    parser: 'babel-eslint',
    extends: ['eslint:recommended', "plugin:jest/recommended"],
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
        'jest/no-disabled-tests': 'warn',
        'jest/no-focused-tests': 'error',
        'jest/no-identical-title': 'error',
        'jest/valid-expect': 'error'
    },
    plugins: [
        "jest"
    ]
};