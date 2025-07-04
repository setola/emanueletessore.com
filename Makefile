DOCKER_IMAGE="hugomods/hugo:latest"
DOCKER_IMAGE_CONSOLE="hugomods/hugo:debian"
DIR="${PWD}/src"
BUILD_DIR=./build
THEME=even

.PHONY : build
.DEFAULT_GOAL := build

build:
	@echo Generating Doc
	@echo -------------------------------
	@git submodule init && git submodule sync && git submodule update
	@docker run -u "$$(id -u):$$(id -g)" --rm -v ${DIR}:/src -w /src/emanueletessore.com "${DOCKER_IMAGE}"

serve:
	@echo Serving Doc
	@echo -------------------------------
	@git submodule init && git submodule sync && git submodule update
	@docker run -u "$$(id -u):$$(id -g)" --rm -it -v ${DIR}:/src -p 1313:1313 -w /src/emanueletessore.com "${DOCKER_IMAGE}" server

console:
	@echo Opening console into container
	@echo -------------------------------
	@git submodule init && git submodule sync && git submodule update
	@docker run -u "$$(id -u):$$(id -g)" --rm -it -v ${DIR}:/src "${DOCKER_IMAGE_CONSOLE}" shell
