module.exports = {
  transformIgnorePatterns: ['/node_modules/(?!@babel)'],
  preset: '@vue/cli-plugin-unit-jest',
  "moduleNameMapper": {
    "^.+\\.(css|styl|less|sass|scss|png|jpg|ttf|woff|woff2)$": "jest-transform-css"
  }
}
