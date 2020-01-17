## [2.0.2](https://github.com/devexperts/remote-data-ts/compare/v2.0.1...v2.0.2) (2020-01-17)



## [2.0.1](https://github.com/devexperts/remote-data-ts/compare/v2.0.0...v2.0.1) (2019-12-03)



# [2.0.0](https://github.com/devexperts/remote-data-ts/compare/v0.6.0...v2.0.0) (2019-08-23)


### Code Refactoring

* fp-ts@2 support added ([#34](https://github.com/devexperts/remote-data-ts/issues/34)) ([b7ad152](https://github.com/devexperts/remote-data-ts/commit/b7ad152))


### feature

* classless ([#35](https://github.com/devexperts/remote-data-ts/issues/35)) ([7351a88](https://github.com/devexperts/remote-data-ts/commit/7351a88))
* update RemoteDataT ([#36](https://github.com/devexperts/remote-data-ts/issues/36)) ([4249fc2](https://github.com/devexperts/remote-data-ts/commit/4249fc2))


### BREAKING CHANGES

* transformer was completely rewritten
* removed classes
* simplified `io-ts` codec
* fp-ts and io-ts-types dependencies updated to latest stable version



# [0.6.0](https://github.com/devexperts/remote-data-ts/compare/v0.5.0...v0.6.0) (2019-05-26)


### Bug Fixes

* incorrect json pending type ([#32](https://github.com/devexperts/remote-data-ts/issues/32)) ([eba21eb](https://github.com/devexperts/remote-data-ts/commit/eba21eb)), closes [#31](https://github.com/devexperts/remote-data-ts/issues/31)


### Features

* Add RemoteDataT transformer ([#29](https://github.com/devexperts/remote-data-ts/issues/29)) ([9d2d0f2](https://github.com/devexperts/remote-data-ts/commit/9d2d0f2))



# [0.5.0](https://github.com/devexperts/remote-data-ts/compare/v0.3.1...v0.5.0) (2019-01-31)


### Bug Fixes

* move peer dependencies to dependencies ([#24](https://github.com/devexperts/remote-data-ts/issues/24)) ([0812d29](https://github.com/devexperts/remote-data-ts/commit/0812d29)), closes [#23](https://github.com/devexperts/remote-data-ts/issues/23)


### Features

* add io-ts type ([#19](https://github.com/devexperts/remote-data-ts/issues/19)) ([7d6785f](https://github.com/devexperts/remote-data-ts/commit/7d6785f))
* major update - Fail fast ap, TS/fp-ts/io-ts upgrade, Traversable2v, Bifunctor ([#28](https://github.com/devexperts/remote-data-ts/issues/28)) ([3955c17](https://github.com/devexperts/remote-data-ts/commit/3955c17)), closes [#26](https://github.com/devexperts/remote-data-ts/issues/26)
* provide progress parameter via fold pending parameter ([#20](https://github.com/devexperts/remote-data-ts/issues/20)) ([1cf41ce](https://github.com/devexperts/remote-data-ts/commit/1cf41ce))
* relax getMonoid dependencies to Semigroup instances instead of Monoid ([#21](https://github.com/devexperts/remote-data-ts/issues/21)) ([d7b060e](https://github.com/devexperts/remote-data-ts/commit/d7b060e))


### BREAKING CHANGES

* new status priority, new dependencies, see #28 for more info
* add io-ts and io-ts-types to peer-dependencies



## [0.3.1](https://github.com/devexperts/remote-data-ts/compare/v0.3.0...v0.3.1) (2018-10-16)


### Features

* Add toEither method ([#16](https://github.com/devexperts/remote-data-ts/issues/16)) ([a314bb5](https://github.com/devexperts/remote-data-ts/commit/a314bb5))



# [0.3.0](https://github.com/devexperts/remote-data-ts/compare/0.2.0...v0.3.0) (2018-09-25)


### Features

* add "recover" method ([27d5591](https://github.com/devexperts/remote-data-ts/commit/27d5591)), closes [#12](https://github.com/devexperts/remote-data-ts/issues/12)
* Add progress to RemotePending ([4c89823](https://github.com/devexperts/remote-data-ts/commit/4c89823)), closes [#9](https://github.com/devexperts/remote-data-ts/issues/9)
* update to TS@2.8.1, fp-ts@1.2.0 + implement Monoidal ([d9a4a09](https://github.com/devexperts/remote-data-ts/commit/d9a4a09))



# 0.2.0 (2018-03-20)



