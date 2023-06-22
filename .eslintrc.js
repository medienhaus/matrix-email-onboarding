module.exports = {
    env: {
        node: true,
    },
    plugins: ['matrix-org', 'lodash'],
    extends: ['plugin:matrix-org/babel', 'plugin:matrix-org/javascript', 'plugin:lodash/canonical'],
    rules: {
        'new-cap': 'off',
        'quotes': ['error', 'single', { avoidEscape: true }],
    },
};
