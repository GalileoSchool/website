# this allows us to run commands on most systems using the tool 'make'.
# for example, to transpile the code into the build directory, one can run:
#  make build

# Define platform-specific commands
ifeq ($(OS),Windows_NT) # Windows
RM = rmdir /s /q
FIND_DS = powershell -NoProfile -Command "Get-ChildItem -Path . -Recurse -Filter '.DS_Store' -Force -ErrorAction SilentlyContinue | Remove-Item -Force"
else # Unix/Linux/Mac
RM = rm -rf
FIND_DS = find . -name '*.DS_Store' -type f -delete
endif


dependencycheck:
	@echo "Check tools ****************************************************************"
	git --version
	node --version
	npm --version

firsttimesetup:
	@echo "Downloading node modules ***************************************************"
	npm install

clean:
	@echo "clean the directory from all annoying OS X .DS_Store files"
	@$(FIND_DS)

build:
	@echo "Building in build/ *********************************************************"
	@$(RM) build
	node build
	@echo "The End *******************************************************************"

.PHONY: dependencycheck clean firsttimesetup build
