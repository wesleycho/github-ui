# GitHub sample app

## Setup

- Install [node.js](https://nodejs.org/)
- Run `npm install -g http-server karma-cli`
- Run `npm install`
- Run `http-server -p 8000`
- Navigate to `localhost:8000` in your local up to date Chrome

## Tests

- Run `npm run test` to run tests

## Summary

This is a simple demo app that queries for a specified organization name and displays the repositories, ordered by popularity (stargazer count). When a user clicks a given repository, a list of commits is displayed, allowing one to browse the history simply, ordered by history.

## Critiques

Sometimes newer requests obtain a response faster than older ones when querying for all the repositories in an organization - this would be handled better with a reactive http handler so that when newer requests are made, older requests could be aborted and the results would not pollute the handling logic in the promises.

Concatenating scripts into two minified vendor & app scripts also would reduce the number of http requests made while allowing some caching benefits to apply.

The UI only allows querying for the 30 most recent commits for a selected repository in an organization - it would be nice if this was extended to allow it to query for more using GitHub's paginated api.

The auth layer is a little too tied up with the GitHub api querying in this app - ideally it should be separated out.
