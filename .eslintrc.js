"use strict"

module.exports = {
  root: true,
  extends: ["eslint:recommended", "plugin:vue/recommended"],
  parserOptions: {
    ecmaVersion: 2017,
    sourceType: "module",
    parser: "babel-eslint"
  },
  env: {
    browser: true,
    es6: true,
    node: true
  },
  plugins: ["vue"],
  rules: {
    // allow debugger during development
    "no-debugger": process.env.NODE_ENV === "production" ? 2 : 0,
    "no-undef": "error",
    "no-unused-vars": "error",
    quotes: ["error", "backtick"],
    "no-var": "error",
    "no-multiple-empty-lines": ["error", {"max": 1}],
    "prefer-const": [
      "error",
      {
        destructuring: "all",
        ignoreReadBeforeAssign: false
      }
    ],
    "vue/max-attributes-per-line": [
      "error",
      {
        singleline: 3,
        multiline: {
          max: 1,
          allowFirstLine: false
        }
      }
    ],
    "vue/html-closing-bracket-newline": [
      "error",
      {
        singleline: "never",
        multiline: "always"
      }
    ],
    "vue/multiline-html-element-content-newline": [
      "error",
      {
        ignores: ["pre", "textarea"]
      }
    ],
    "quote-props": ["error", "as-needed", { "unnecessary": true }],
    "object-curly-spacing": ["error", "always"],
    "array-bracket-spacing": ["error", "never"],
    "indent": ["error", 2, {
      "SwitchCase": 1,
      "flatTernaryExpressions": true,
      "ObjectExpression": 1,
      "ArrayExpression": 1,
      "MemberExpression": 1,
      "CallExpression": {"arguments": 1},
      "FunctionExpression": {"body": 1, "parameters": 2},
      "VariableDeclarator": "first"
    }],
    "object-curly-newline": ["error", {
      "ObjectExpression": { "multiline": true, "minProperties": 1 },
      "ObjectPattern": { "multiline": true },
      "ImportDeclaration": { "multiline": true, "minProperties": 3 },
      "ExportDeclaration": { "multiline": true, "minProperties": 3 }
    }],
    "brace-style": ["error", "1tbs"],
    "max-len": ["error", { "code": 80, "ignoreStrings": true, "ignoreComments": true, "ignoreTemplateLiterals": true }],
    "no-console": "off",
    "semi": ["error", "never"],
    "no-trailing-spaces": ["error", { "skipBlankLines": false }]
  }
}
