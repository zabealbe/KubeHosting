(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
module.exports={
  "name": "yaml",
  "version": "2.1.1",
  "license": "ISC",
  "author": "Eemeli Aro <eemeli@gmail.com>",
  "repository": "github:eemeli/yaml",
  "description": "JavaScript parser and stringifier for YAML",
  "keywords": [
    "YAML",
    "parser",
    "stringifier"
  ],
  "homepage": "https://eemeli.org/yaml/",
  "files": [
    "browser/",
    "dist/",
    "util.d.ts",
    "util.js"
  ],
  "type": "commonjs",
  "main": "./dist/index.js",
  "browser": {
    "./dist/index.js": "./browser/index.js",
    "./dist/util.js": "./browser/dist/util.js",
    "./util.js": "./browser/dist/util.js"
  },
  "exports": {
    ".": {
      "node": "./dist/index.js",
      "default": "./browser/index.js"
    },
    "./package.json": "./package.json",
    "./util": {
      "node": "./dist/util.js",
      "default": "./browser/dist/util.js"
    }
  },
  "scripts": {
    "build": "npm run build:node && npm run build:browser",
    "build:browser": "rollup -c config/rollup.browser-config.js",
    "build:node": "rollup -c config/rollup.node-config.js",
    "clean": "git clean -fdxe node_modules",
    "lint": "eslint src/",
    "prettier": "prettier --write .",
    "prestart": "npm run build:node",
    "start": "node -i -e 'YAML=require(\"./dist/index.js\")'",
    "test": "jest --config config/jest.config.js",
    "test:all": "npm test && npm run test:types && npm run test:dist && npm run test:dist:types",
    "test:browsers": "cd playground && npm test",
    "test:dist": "npm run build:node && jest --config config/jest.config.js",
    "test:dist:types": "tsc --allowJs --moduleResolution node --noEmit --target es5 dist/index.js",
    "test:types": "tsc --noEmit",
    "docs:install": "cd docs-slate && bundle install",
    "docs:deploy": "cd docs-slate && ./deploy.sh",
    "docs": "cd docs-slate && bundle exec middleman server",
    "preversion": "npm test && npm run build",
    "prepublishOnly": "npm run clean && npm test && npm run build"
  },
  "browserslist": "defaults, not ie 11",
  "prettier": {
    "arrowParens": "avoid",
    "semi": false,
    "singleQuote": true,
    "trailingComma": "none"
  },
  "devDependencies": {
    "@babel/core": "^7.12.10",
    "@babel/plugin-proposal-class-properties": "^7.12.1",
    "@babel/plugin-proposal-nullish-coalescing-operator": "^7.12.1",
    "@babel/plugin-transform-typescript": "^7.12.17",
    "@babel/preset-env": "^7.12.11",
    "@rollup/plugin-babel": "^5.2.3",
    "@rollup/plugin-replace": "^4.0.0",
    "@rollup/plugin-typescript": "^8.1.1",
    "@types/jest": "^27.0.1",
    "@types/node": "^12.20.47",
    "@typescript-eslint/eslint-plugin": "^5.3.1",
    "@typescript-eslint/parser": "^5.3.1",
    "babel-jest": "^28.1.0",
    "cross-env": "^7.0.3",
    "eslint": "^8.2.0",
    "eslint-config-prettier": "^8.1.0",
    "fast-check": "^2.12.0",
    "jest": "^28.1.0",
    "jest-ts-webcompat-resolver": "^1.0.0",
    "prettier": "^2.2.1",
    "rollup": "^2.38.2",
    "tslib": "^2.1.0",
    "typescript": "^4.3.5"
  },
  "engines": {
    "node": ">= 14"
  }
}

},{}]},{},[1]);
