# Yarn safe-update

Updates all packages in `yarn.lock` file safety.

## Usage

    $ yarn-safe-update -h

## Development

### With [Docker](https://www.docker.com)

Install dependencies:

    $ docker run --rm -t -v "%PWD%:/usr/src/app" -w /usr/src/app node:6-slim yarn --ignore-optional --ignore-engines --no-bin-links

Check and run:

    $ docker run --rm -t -v "%PWD%:/usr/src/app" -w /usr/src/app node:6-slim /bin/sh -c "yarn format -c && yarn lint && yarn build && yarn test"
    $ docker run --rm -t -v "%PWD%:/usr/src/app" -w /usr/src/app node:6-slim node dist/cli.js -p test/fixtures/yarn.lock

**NOTE** the `%PWD%` is the project working directory, like: `/c/Users/xxx/repo/yarn-safe-update`
