module.exports = {
  extends: ['stylelint-config-standard'],
  rules: {
    // Tailwind's package imports must not be rewritten to CSS url() imports.
    'import-notation': 'string',
    'at-rule-no-unknown': [true, {
      ignoreAtRules: ['config', 'source', 'theme', 'utility', 'custom-variant', 'plugin', 'apply'],
    }],
    // The upstream theme intentionally groups light/dark overrides by component.
    'no-descending-specificity': null,
    // Tailwind variants contain escaped colons, not just kebab-case names.
    'selector-class-pattern': null,
  },
};
