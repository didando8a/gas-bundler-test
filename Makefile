.DEFAULT_GOAL := help
.SILENT:

# Colours used in help
GREEN    := $(shell tput -Txterm setaf 2)
WHITE    := $(shell tput -Txterm setaf 7)
YELLOW   := $(shell tput -Txterm setaf 3)
RESET    := $(shell tput -Txterm sgr0)

HELP_FUN = %help; \
	while(<>) { push @{$$help{$$2 // 'Misc'}}, [$$1, $$3] \
	if /^([a-zA-Z0-9\-]+)\s*:.*\#\#(?:@([a-zA-Z\-]+))?\s(.*)$$/ }; \
	for (sort keys %help) { \
	print "${WHITE}$$_${RESET}\n"; \
	for (@{$$help{$$_}}) { \
	$$sep = " " x (32 - length $$_->[0]); \
	print "  ${YELLOW}$$_->[0]${RESET}$$sep${GREEN}$$_->[1]${RESET}\n"; \
	}; \
	print "\n"; } \
	$$sep = " " x (32 - length "help"); \
	print "${WHITE}Options${RESET}\n"; \
	print "  ${YELLOW}help${RESET}$$sep${GREEN}Prints this help${RESET}\n";

help:
	@echo "\nUsage: make ${YELLOW}<target>${RESET}\n\nThe following targets are available:\n";
	@perl -e '$(HELP_FUN)' $(MAKEFILE_LIST)

################
### Building ###
################

deps:
#	test -f .clasp.json || cp .clasp.json.dist .clasp.json

dev: deps build dependencies-install up ##@Docker Brings up the local development stack from nothing

up: ##@Docker Brings up the local development stack
	docker-compose up -d

build: deps ##@Docker Builds any missing or out-of-date container images
	docker-compose build

start: ##@Docker Starts the local development stack without rebuilding container images or installing dependencies
	docker-compose start

stop: ##@Docker Stops the local development stack
	docker-compose stop

destroy: ##@Docker Tears down the entire local development stack
	docker-compose down -v --remove-orphans

logs: ##@Docker Displays and follows the Docker container logs
	docker-compose logs -f

ps: ##@Docker Gets the running status of the containers
	docker-compose ps

dev-shell: ##@Docker Drops you into a shell inside the worker service
	docker-compose run --no-deps --rm node /bin/bash

####################
### Dependencies ###
####################

dependencies-install: ##@Dependencies Installs the NPM dependencies
	docker-compose run --no-deps --rm node npm install

#############
### Tests ###
#############

tests-unit: ##@Tests Runs all unit tests
	docker-compose run --rm node npm run test-unit

tests-all: ##@Tests Runs all tests
	make tests-unit


tests-suite: ##@Test Runs all tests in a filename. Use: make tests-suite filepath=tests/functional/loanEvents/distributions/writeoff.spec.js
	docker-compose run --rm node npm run test-suite -- $(filepath)

###############
### Quality ###
###############

lint: ##@Quality Runs linting analysis
	docker-compose run --no-deps --rm node npm run lint

lint-fix: ##@Quality Runs linting analysis automatically fixing what can be fixed
	docker-compose run --no-deps --rm node npm run lint:fix

###############
### NPM ###
###############

publish: ##@Publish package to npm
	docker-compose run --no-deps --rm node npm publish --access=public

