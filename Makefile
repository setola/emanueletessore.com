DOCKER_IMAGE="hugomods/hugo:debian-ci-non-root"

.PHONY : build
.DEFAULT_GOAL := build

build:
	@echo Generating Doc
	@echo -------------------------------
	@git submodule init && git submodule sync && git submodule update
	@docker run -u "$$(id -u):$$(id -g)" --rm -v ${PWD}:/src -w /src/src/emanueletessore.com "${DOCKER_IMAGE}" npm ci
	@docker run -u "$$(id -u):$$(id -g)" --rm -v ${PWD}:/src -w /src/src/emanueletessore.com "${DOCKER_IMAGE}" build