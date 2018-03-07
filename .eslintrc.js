module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module'
  },
  env: {
    browser: true,
    node: true
  },
  extends: 'standard',
  plugins: [
    'html'
  ],
  'rules': {
    // allow paren-less arrow functions
    'arrow-parens': 0,
    // allow async-await
    'generator-star-spacing': 0,
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0,
    // unify spacing in objects
    'object-curly-spacing': ["error", "always"],
    'object-curly-newline': ["error", { 
      "ObjectExpression": { "multiline": true, "minProperties": 3 },
      "ImportDeclaration": "never"
    }]
  }
}
