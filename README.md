# Yarn safe-update

Updates all packages in `yarn.lock` file safety.

## Usage

    $ yarn-safe-update -h

## Development

### With [Docker](https://www.docker.com)

Install dependencies:

    $ docker run --rm -it -v "%PWD%:/usr/src/app" -w /usr/src/app node:10-alpine yarn --ignore-optional --no-bin-links

Test and run:

    $ docker run --rm -it -v "%PWD%:/usr/src/app" -w /usr/src/app node:10-alpine /bin/sh -c "yarn format -c && yarn lint && yarn test"
    $ docker run --rm -it -v "%PWD%:/usr/src/app" -w /usr/src/app node:10-alpine /bin/sh -c "yarn build && node dist/cli.js"

**NOTE** the `%PWD%` is the project working directory, like: `/c/Users/xxx/repo/yarn-safe-update`
