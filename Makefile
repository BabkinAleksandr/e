.PHONY: server
server:
	START_SERVER=true bun run ./tests/server.js

.PHONY: test
test:
	bun test "$1"
