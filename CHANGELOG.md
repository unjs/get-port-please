# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## v3.0.3

[compare changes](https://github.com/unjs/get-port-please/compare/v3.0.2...v3.0.3)

### 🩹 Fixes

- Validate hostname and improve errors ([#59](https://github.com/unjs/get-port-please/pull/59))
- Skip all listen errors ([#61](https://github.com/unjs/get-port-please/pull/61))

### 💅 Refactors

- Split internals and types ([cf4317c](https://github.com/unjs/get-port-please/commit/cf4317c))

### 🏡 Chore

- Run tests on windows ([#60](https://github.com/unjs/get-port-please/pull/60))
- Use changelogen for releases ([7d4d6bb](https://github.com/unjs/get-port-please/commit/7d4d6bb))

### ✅ Tests

- Block host on all interfaces ([5a95184](https://github.com/unjs/get-port-please/commit/5a95184))
- Skip invalid host tests on windows ([e8b92ac](https://github.com/unjs/get-port-please/commit/e8b92ac))

### 🎨 Styles

- Lint ([1501204](https://github.com/unjs/get-port-please/commit/1501204))

### ❤️ Contributors

- Pooya Parsa ([@pi0](http://github.com/pi0))

### [3.0.2](https://github.com/unjs/get-port-please/compare/v3.0.1...v3.0.2) (2023-08-27)


### Bug Fixes

* use random port when `port: 0` is set ([081ed99](https://github.com/unjs/get-port-please/commit/081ed99661bb63e7910194e1c802ec0d33d75953))

### [3.0.1](https://github.com/unjs/get-port-please/compare/v3.0.0...v3.0.1) (2023-01-03)


### Bug Fixes

* use `process.env.PORT` as default value if `port` option is missing ([#27](https://github.com/unjs/get-port-please/issues/27)) ([57e1232](https://github.com/unjs/get-port-please/commit/57e1232274fe703d3b3039362d57c9897dae0e38))

## [3.0.0](https://github.com/unjs/get-port-please/compare/v2.6.1...v3.0.0) (2022-11-14)


### ⚠ BREAKING CHANGES

* no default value for `alternativePortRange` if explicit `port` provided
* drop memo support

### Bug Fixes

* no default value for `alternativePortRange` if explicit `port` provided ([00366ae](https://github.com/unjs/get-port-please/commit/00366aeae4226de8dd47532137dce39be6297050)), closes [#15](https://github.com/unjs/get-port-please/issues/15)


* drop memo support ([bc6f5c5](https://github.com/unjs/get-port-please/commit/bc6f5c5baa99b72fe3136230ba995e6df06b27e9))

### [2.6.1](https://github.com/unjs/get-port-please/compare/v2.6.0...v2.6.1) (2022-08-08)


### Bug Fixes

* ignore falsy `config.port` option ([ca34365](https://github.com/unjs/get-port-please/commit/ca343657a02fbfa97fbc0822a18b6cd2f3766032))

## [2.6.0](https://github.com/unjs/get-port-please/compare/v2.5.0...v2.6.0) (2022-08-08)


### Features

* alternative port and verbose logging ([49200e6](https://github.com/unjs/get-port-please/commit/49200e6df6ca6ba9283cc3e7162b44b5ef0906e6))
* verbose logging (opt-in) ([779f3b7](https://github.com/unjs/get-port-please/commit/779f3b763c2d9ff44bba5594f944b4019d95b2b5))


### Bug Fixes

* generate range before passing to findPort ([848a8c2](https://github.com/unjs/get-port-please/commit/848a8c2bb588431861a0d29b243aad6c024f48cf))

## [2.5.0](https://github.com/unjs/get-port-please/compare/v2.4.3...v2.5.0) (2022-04-11)


### Features

* `portRange` support ([44c8acd](https://github.com/unjs/get-port-please/commit/44c8acdc7a26de5b7308ee409543a7f9e8fdb275))
* ignore unsafe ports ([#8](https://github.com/unjs/get-port-please/issues/8)) ([dd29cbd](https://github.com/unjs/get-port-please/commit/dd29cbd174c6676869cfb114c33671126c48ce86))

### [2.4.3](https://github.com/unjs/get-port-please/compare/v2.4.2...v2.4.3) (2022-02-28)


### Bug Fixes

* **waitForPort:** check for all available hosts by default ([ba5f3b0](https://github.com/unjs/get-port-please/commit/ba5f3b0dfe80b016719be2349bbf62914f9905c8))

### [2.4.2](https://github.com/unjs/get-port-please/compare/v2.4.1...v2.4.2) (2022-02-25)


### Bug Fixes

* **waitForPort:** wait for delay ([01497a8](https://github.com/unjs/get-port-please/commit/01497a80943116ff9a82aa516509044ae2a7d979))

### [2.4.1](https://github.com/unjs/get-port-please/compare/v2.4.0...v2.4.1) (2022-02-25)


### Bug Fixes

* **getRandomPort:** host argument is optional ([7081383](https://github.com/unjs/get-port-please/commit/70813834ba289c631df379b0ddd34eccbe54b0d4))

## [2.4.0](https://github.com/unjs/get-port-please/compare/v2.3.0...v2.4.0) (2022-02-25)


### Features

* check port against all available hosts ([bac49cc](https://github.com/unjs/get-port-please/commit/bac49cc4de6aea681314c794284cca684c25e0fa))
* export `waitForPort` ([1c42832](https://github.com/unjs/get-port-please/commit/1c4283292353e908fa3049e0b3f60f23338c6cff))

## [2.3.0](https://github.com/unjs/get-port-please/compare/v2.2.0...v2.3.0) (2022-02-10)


### Features

* export `checkPort` utils ([#6](https://github.com/unjs/get-port-please/issues/6)) ([c248dff](https://github.com/unjs/get-port-please/commit/c248dff81a7eb3acc20f0277d1eae00130e43d0d))

## [2.2.0](https://github.com/unjs/get-port-please/compare/v2.1.0...v2.2.0) (2021-04-12)


### Features

* add `host` option ([#4](https://github.com/unjs/get-port-please/issues/4)) ([f85d941](https://github.com/unjs/get-port-please/commit/f85d94154e3832e3cf854c2d631329c29e71df92))


### Bug Fixes

* resolve defaults at `getPort` ([dcab479](https://github.com/unjs/get-port-please/commit/dcab4795d49184c7e4df115372f43e4eec52fbe3))

## [2.1.0](https://github.com/unjs/get-port-please/compare/v2.0.0...v2.1.0) (2020-12-04)


### Features

* allow config to be string or number ([13f4275](https://github.com/unjs/get-port-please/commit/13f4275e021fe1cd69c3ac775c284d92cd6c601d))

## [2.0.0](https://github.com/unjs/get-port-please/compare/v1.1.0...v2.0.0) (2020-12-04)


### ⚠ BREAKING CHANGES

* use named exports

### Features

* use named exports ([37e5aa2](https://github.com/unjs/get-port-please/commit/37e5aa2a485165c325f674951cef324889318304))

## [1.1.0](https://github.com/unjs/get-port-please/compare/v1.0.0...v1.1.0) (2020-11-16)


### Features

* update fs-memo and improve config handling ([5e4acee](https://github.com/unjs/get-port-please/commit/5e4acee1d7aa47c100815a25a43a508eafbacd6b))

## [1.0.0](https://github.com/unjs/get-port-please/compare/v0.0.6...v1.0.0) (2020-06-16)

### [0.0.6](https://github.com/unjs/get-port-please/compare/v0.0.5...v0.0.6) (2020-06-01)

### [0.0.5](https://github.com/unjs/get-port-please/compare/v0.0.4...v0.0.5) (2020-06-01)


### Bug Fixes

* name is not defined ([c1829f1](https://github.com/unjs/get-port-please/commit/c1829f12cfaf5304661ef16d744bbc66a2610a2d))

### [0.0.4](https://github.com/unjs/get-port-please/compare/v0.0.3...v0.0.4) (2020-06-01)


### Features

* name and random options ([ccea688](https://github.com/unjs/get-port-please/commit/ccea68889f440d0760412caff696dccfeac3144f))

### [0.0.3](https://github.com/unjs/get-port-please/compare/v0.0.2...v0.0.3) (2020-06-01)


### Bug Fixes

* **types:** use interface instead of type infering ([09135eb](https://github.com/unjs/get-port-please/commit/09135ebf0b7c96533b68cabdf8a9c512415e00b8))

### [0.0.2](https://github.com/unjs/get-port-please/compare/v0.0.1...v0.0.2) (2020-06-01)

### 0.0.1 (2020-05-31)


### Bug Fixes

* set version to 0 ([79c01ef](https://github.com/unjs/get-port-please/commit/79c01ef53e9425345bc0ec2cf58287b1fc940a7c))
