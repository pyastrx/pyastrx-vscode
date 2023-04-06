SHELL := /bin/bash

find_vsix_file = $(shell find $(1) -maxdepth 1 -name '*.vsix' -print -quit)

.PHONY: install


package:
	npm run package

create: package
	vsce package

install: package create
	$(eval VSIX_FILE := $(call find_vsix_file,.))
	@echo "VSIX file location: $(dir $(VSIX_FILE))"
	@echo "VSIX file name: $(notdir $(VSIX_FILE))"
	code --install-extension $(VSIX_FILE)

uninstall:
	$(eval VSIX_FILE := $(call find_vsix_file,.))
	@echo "VSIX file location: $(dir $(VSIX_FILE))"
	@echo "VSIX file name: $(notdir $(VSIX_FILE))"
	code --uninstall-extension $(VSIX_FILE)
