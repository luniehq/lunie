# Contributing to Lunie

Thank you for your interest in contributing to Lunie. We've written up some guidelines to help you get your issues looked into faster, and pull requests merged in a timely manner.

## Issue Guidelines

- Before you file an issue, make sure to have read the [README](https://github.com/cosmos/voyager/blob/develop/README.md) and followed the instructions correctly.
- Please label the issue either bug or proposal according to its purpose.
- Please state the version (or commit) of the UI.
- Please describe the bug or your proposed change to the software in as much detail as possible. The faster we can reproduce the bug, the faster we can fix it.
- When screenshots can be used to describe the bug/proposal, please include them.
- If you report a bug, please provide the log content and the steps required to reproduce the bug. The logs can be found at `%USER_HOME%/.cosmos-voyager[-dev]/{network}/main.log`.

## Pull Request Guidelines

- Please confirm that your pull request will pass our linting and unit tests.
- Please make sure your code is properly tested, so that the code coverage is not decreasing.
- Please write `closes #123` somewhere in the pull request. #123 is the issue number you are attempting to fix with this PR. This string will automatically close the issue when the PR is merged.
- If this PR produces a visible change, please provide screenshots showing these changes.
- If the change is difficult to understand, please provide a description on why and how the change helps Lunie.

## Release

- To make an official release, follow the instructions in [docs/release.md](https://github.com/cosmos/voyager/blob/develop/docs/release.md).
