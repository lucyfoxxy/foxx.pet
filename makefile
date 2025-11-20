SHELL := /bin/bash
MAKEFLAGS += -s   # suppress command echoing, only show our messages

# Basis-Pfade
BASE_PATH  ?= /srv/foxx.pet/app
WEB_ROOT   ?= /var/www

# Ein einziges Astro-Projekt (ehemals "dev")
APP        ?= ${BASE_PATH}/dev
DIST       ?= ${APP}/dist

# Deploy-Ziele
DEV_PUB    ?= ${WEB_ROOT}/dev.foxx.pet/public
PROD_PUB   ?= ${WEB_ROOT}/foxx.pet/public

NPM        ?= npm

.PHONY: dev-install dev dev-build prod-build fetch dev-publish prod-publish

## Dependencies installieren
dev-install:
	@echo "📦 Installing dependencies in ${APP}"
	cd ${APP} && ${NPM} install

## Dev-Server starten
dev:
	@echo "🟢 Starting astro dev in ${APP}"
	cd ${APP} && ${NPM} run dev

## Gemeinsames Fetch-Script (Immich etc.)
fetch:
	@echo "⬇️  Running fetch script (shared for dev/prod)"
	cd ${APP} && ${NPM} run fetch

## DEV-Build: bauen & nach dev.foxx.pet deployen
dev-build:
	@echo "🌱 Building DEV in ${APP}"
	cd ${APP} && ${NPM} run build
	@echo "📤 Deploying DEV dist/ → ${DEV_PUB}"
	rsync -av --delete "${DIST}/" "${DEV_PUB}/"
	@echo "✅ DEV build + deploy done"

## PROD-Build: bauen, Test-Route löschen & nach foxx.pet deployen
prod-build:
	@echo "🚀 Building PROD in ${APP}"
	cd ${APP} && ${NPM} run build
	@echo "🧹 Removing test route from dist (dist/test)"
	rm -rf "${DIST}/test"
	@echo "📤 Deploying PROD dist/ → ${PROD_PUB}"
	rsync -av --delete "${DIST}/" "${PROD_PUB}/"
	@echo "✅ PROD build + deploy done"

## Komfort-Shortcuts: Fetch + Build + Deploy
dev-publish:
	@echo "🚀 Publishing DEV (fetch + build + deploy)"
	$(MAKE) fetch
	$(MAKE) dev-build

prod-publish:
	@echo "🚀 Publishing PROD (fetch + build + deploy)"
	$(MAKE) fetch
	$(MAKE) prod-build
