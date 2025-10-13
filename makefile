SHELL := /bin/bash
MAKEFLAGS += -s   # suppress command echoing, only show our messages

BASE_PATH 			  ?= /srv/foxx.pet/app
WEB_ROOT 			  ?= /var/www

DEV_APP        		  ?= ${BASE_PATH}/dev
DEV_DIST  			  ?= ${DEV_APP}/dist
DEV_PUB			      ?= ${WEB_ROOT}/dev.foxx.pet/public

PROD_APP        	  ?= ${BASE_PATH}/prod
PROD_DIST  			  ?= ${PROD_APP}/dist
PROD_PUB			  ?= ${WEB_ROOT}/foxx.pet/public

.PHONY: sync-src do-release \
        dev-install dev-dev dev-build dev-deploy dev-fetch dev-gen dev-publish dev-clean-gen \
        prod-install prod-dev prod-build prod-deploy prod-fetch prod-gen prod-publish prod-clean-gen prod-pretty-publish

# ===== Common =====

sync-src:
	@echo "⚙️  Syncing DEV → PROD sources"
	sudo rsync -avh --delete --exclude-from=scripts/excludes.list $(DEV_APP)/ $(PROD_APP)/
	@echo "✅ Sources synced"

do-release:
	@echo "🚀 Starting release (sync + build + deploy)"
	$(MAKE) -s sync-src
	$(MAKE) -s prod-publish
	@echo "🎉 Release finished"

# ===== DEV =====
clean:
	@echo "🧹 Cleaning nodee_modules + lockfile"
	sudo rm -rf "node_modules" "package-lock.json"
	@echo "✅ DEV done"

install:
	@echo "📦 Installing dependencies"
	npm install && npm ci
	@echo "✅ dependencies installed successfully"

# ===== Fetch =====
dev-fetch:
	@echo "🔄 Fetching DEV data"
	npm run fetch:dev
	@echo "✅ DEV fetch done"

prod-fetch:
	@echo "🔄 Fetching PROD data"
	npm run fetch:prod
	@echo "✅ PROD fetch done"

dev-fetch-quiet:
	
	@npm run fetch-quiet:dev
	

prod-fetch-quiet:
	
	@npm run fetch-quiet:prod
	

# ===== Build =====
dev-build:
	@echo "🏗️  Building DEV"
	npm run build:dev
	@echo "✅ DEV build done"

prod-build:
	@echo "🏗️  Building PROD"
	npm run build:prod
	@echo "✅ PROD build done"
dev-dev:
	@echo "🏗️  dev server started for DEV"
	npm run dev:dev
	@echo "✅ dev server ended"

prod-dev:
	@echo "🏗️  dev server started for PROD"
	npm run prod:dev
	@echo "✅ dev server ended"
# ===== Deploy (nur rsync) =====
dev-deploy:
	@echo "🚚 Deploying DEV → $(DEV_PUB)"
	sudo rsync -a --delete $(DEV_DIST)/ $(DEV_PUB)
	@echo "✅ DEV deploy done"

prod-deploy:
	@echo "🚚 Deploying PROD → $(PROD_PUB)"
	sudo rsync -a --delete $(PROD_DIST)/ $(PROD_PUB)
	@echo "✅ PROD deploy done"
# ===== Sync =====
dev-sync:
	@echo "🏗️  Syncing DEV"
	npm run sync:dev
	@echo "✅ DEV sync done"

prod-sync:
	@echo "🏗️  Syncing PROD"
	npm run sync:prod
	@echo "✅ PROD sync done"
# ===== Publish =====
dev-publish:
	@echo "🚀 Publishing DEV (fetch+build+deploy)"
	$(MAKE) -s dev-fetch
	$(MAKE) -s dev-build
	$(MAKE) -s dev-deploy
	@echo "✅ DEV publish done"

prod-publish:
	@echo "🚀 Publishing PROD (fetch+build+deploy)"
	$(MAKE) -s prod-fetch
	$(MAKE) -s prod-build
	$(MAKE) -s prod-deploy
	@echo "✅ PROD publish done"

