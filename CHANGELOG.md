# [2.1.0](https://github.com/devexperts/remote-data-ts/compare/v2.0.4...v2.1.0) (2021-08-17)


### Features

* add Fold 3 ([#53](https://github.com/devexperts/remote-data-ts/issues/53)) ([5c26c11](https://github.com/devexperts/remote-data-ts/commit/5c26c110456e9431db1f34c8440b7ddc58013333)), closes [#30](https://github.com/devexperts/remote-data-ts/issues/30)
* Support for import without lib or es6 ([#65](https://github.com/devexperts/remote-data-ts/issues/65)) ([02b8f08](https://github.com/devexperts/remote-data-ts/commit/02b8f0891b0dcc2fafd42354e8755d51e55f9368))


* Update constructors to receive all generics (#61) ([674a2ac](https://github.com/devexperts/remote-data-ts/commit/674a2ac3f5f09f73aab5d8192fca64acf041aec6)), closes [#61](https://github.com/devexperts/remote-data-ts/issues/61)


### Bug Fixes

* Correct `RemoteDataT3` constrant for `M` (`URIS4` -> `URIS3`) ([f81f3b8](https://github.com/devexperts/remote-data-ts/commit/f81f3b8d819bd0642ba00beebbe19e938e97a3fc))


### BREAKING CHANGES

* generic parameters changed for `success` and `failure` constructors



## [2.0.4](https://github.com/devexperts/remote-data-ts/compare/v2.0.3...v2.0.4) (2020-08-11)


### Bug Fixes

* rewrite imports from lib to es6 in es6 output ([c6899d8](https://github.com/devexperts/remote-data-ts/commit/c6899d8e70ee5f3c617b0bf7756dfb2a7f0dda6e)), closes [#46](https://github.com/devexperts/remote-data-ts/issues/46) [#49](https://github.com/devexperts/remote-data-ts/issues/49)



## [2.0.3](https://github.com/devexperts/remote-data-ts/compare/v2.0.2...v2.0.3) (2020-01-24)


### Bug Fixes

* fix bimap, mapLeft, extend to forward progress correctly ([#45](https://github.com/devexperts/remote-data-ts/issues/45)) ([be78635](https://github.com/devexperts/remote-data-ts/commit/be78635c4cf77a9dd1531b745f17638194b0e15a))



## [2.0.2](https://github.com/devexperts/remote-data-ts/compare/v2.0.0...v2.0.2) (2020-01-17)



# [2.0.0](https://github.com/devexperts/remote-data-ts/compare/v0.6.0...v2.0.0) (2019-08-23)


### Code Refactoring

* fp-ts@2 support added ([#34](https://github.com/devexperts/remote-data-ts/issues/34)) ([b7ad152](https://github.com/devexperts/remote-data-ts/commit/b7ad152d5058129f05c9e5a1d901310250b1dbbe))


### feature

* classless ([#35](https://github.com/devexperts/remote-data-ts/issues/35)) ([7351a88](https://github.com/devexperts/remote-data-ts/commit/7351a880e2cd416449d33e870675e967a2f23916))
* update RemoteDataT ([#36](https://github.com/devexperts/remote-data-ts/issues/36)) ([4249fc2](https://github.com/devexperts/remote-data-ts/commit/4249fc2722a28727132ced10d255d327007b93b0))


### BREAKING CHANGES

* transformer was completely rewritten
* removed classes
* simplified `io-ts` codec
* fp-ts and io-ts-types dependencies updated to latest stable version



# [0.6.0](https://github.com/devexperts/remote-data-ts/compare/v0.5.0...v0.6.0) (2019-05-26)


### Bug Fixes

* incorrect json pending type ([#32](https://github.com/devexperts/remote-data-ts/issues/32)) ([eba21eb](https://github.com/devexperts/remote-data-ts/commit/eba21eb7643741d01ce8776ea56b94b18103dc82)), closes [#31](https://github.com/devexperts/remote-data-ts/issues/31)


### Features

* Add RemoteDataT transformer ([#29](https://github.com/devexperts/remote-data-ts/issues/29)) ([9d2d0f2](https://github.com/devexperts/remote-data-ts/commit/9d2d0f2bec494a033f10f2659eb456c0f781dcdd))



# [0.5.0](https://github.com/devexperts/remote-data-ts/compare/v0.3.1...v0.5.0) (2019-01-31)


### Bug Fixes

* move peer dependencies to dependencies ([#24](https://github.com/devexperts/remote-data-ts/issues/24)) ([0812d29](https://github.com/devexperts/remote-data-ts/commit/0812d29796723f51ef8c1ea6c222b6e2291ab34e)), closes [#23](https://github.com/devexperts/remote-data-ts/issues/23)


### Features

* add io-ts type ([#19](https://github.com/devexperts/remote-data-ts/issues/19)) ([7d6785f](https://github.com/devexperts/remote-data-ts/commit/7d6785f4211ee263dacc73100677ca5c0b1994d2))
* major update - Fail fast ap, TS/fp-ts/io-ts upgrade, Traversable2v, Bifunctor ([#28](https://github.com/devexperts/remote-data-ts/issues/28)) ([3955c17](https://github.com/devexperts/remote-data-ts/commit/3955c175e427dacdb87ec7351ea451b0b7c454ad)), closes [#26](https://github.com/devexperts/remote-data-ts/issues/26)
* provide progress parameter via fold pending parameter ([#20](https://github.com/devexperts/remote-data-ts/issues/20)) ([1cf41ce](https://github.com/devexperts/remote-data-ts/commit/1cf41ceda67507d979068471214d687ffe8b967c))
* relax getMonoid dependencies to Semigroup instances instead of Monoid ([#21](https://github.com/devexperts/remote-data-ts/issues/21)) ([d7b060e](https://github.com/devexperts/remote-data-ts/commit/d7b060e9298af11419991629f5da28d44759f972))


### BREAKING CHANGES

* new status priority, new dependencies, see #28 for more info
* add io-ts and io-ts-types to peer-dependencies



## [0.3.1](https://github.com/devexperts/remote-data-ts/compare/v0.3.0...v0.3.1) (2018-10-16)


### Features

* Add toEither method ([#16](https://github.com/devexperts/remote-data-ts/issues/16)) ([a314bb5](https://github.com/devexperts/remote-data-ts/commit/a314bb53e753307879d069ad1591e819260a871b))



# [0.3.0](https://github.com/devexperts/remote-data-ts/compare/0.2.0...v0.3.0) (2018-09-25)


### Features

* add "recover" method ([27d5591](https://github.com/devexperts/remote-data-ts/commit/27d559131dee5aa316b8c1e91d56db9176b1db05)), closes [#12](https://github.com/devexperts/remote-data-ts/issues/12)
* Add progress to RemotePending ([4c89823](https://github.com/devexperts/remote-data-ts/commit/4c89823a66852ea0bb4924e95603d5c2bad388f8)), closes [#9](https://github.com/devexperts/remote-data-ts/issues/9)
* update to TS@2.8.1, fp-ts@1.2.0 + implement Monoidal ([d9a4a09](https://github.com/devexperts/remote-data-ts/commit/d9a4a09296940dbadd54c3b8c32aeaba31a7686d))



# 0.2.0 (2018-03-20)



