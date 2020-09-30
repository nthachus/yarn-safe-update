# Yarn safe-update

Updates all packages in `yarn.lock` file safety.

## Usage

    $ yarn-safe-update -h

## Development

### With [Node 10+](https://nodejs.org) and [Yarn](https://classic.yarnpkg.com/en)

Install dependencies:

    $ yarn --ignore-optional

Check and run:

    $ yarn format -c && yarn lint && yarn test
    $ yarn build && node dist/cli.js path/to/yarn.lock

### With [Docker](https://www.docker.com)

Install dependencies:

    $ docker run --rm -t -v "%PWD%:/usr/src/app" -w /usr/src/app node:8-alpine yarn --ignore-optional --ignore-engines

Check and run:

    $ docker run --rm -t -v "%PWD%:/usr/src/app" -w /usr/src/app node:8-alpine /bin/sh -c "yarn format -c && yarn lint && yarn test"
    $ docker run --rm -t -v "%PWD%:/usr/src/app" -w /usr/src/app node:6-alpine /bin/sh -c "yarn build && node dist/cli.js test/fixtures/yarn.lock"

**NOTE** the `%PWD%` is the project working directory, like: `/c/Users/xxx/repo/yarn-safe-update`
