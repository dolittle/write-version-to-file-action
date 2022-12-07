# [2.1.2] - 2022-12-7 [PR: #21](https://github.com/dolittle/write-version-to-file-action/pull/21)
## Summary

Update deps and modernise


# [2.1.1] - 2021-10-26 [PR: #20](https://github.com/dolittle/write-version-to-file-action/pull/20)
## Summary

Remove extra quote


# [2.1.0] - 2021-10-26 [PR: #19](https://github.com/dolittle/write-version-to-file-action/pull/19)
## Summary

Adds a `merge-strategies` input that defines how `git pull` should deal with diverging branches. Can be either `merge` (default), `rebase` or `fast-forward`.


# [2.0.2] - 2021-8-27 [PR: #18](https://github.com/dolittle/write-version-to-file-action/pull/18)
## Summary

Configure the git user before pulling to avoid it crashing


# [2.0.1] - 2021-8-27 [PR: #17](https://github.com/dolittle/write-version-to-file-action/pull/17)
## Summary

Pull before pushing commit

### Changed

- Does a git pull before git push


# [2.0.0] - 2021-8-18 [PR: #16](https://github.com/dolittle/write-version-to-file-action/pull/16)
## Summary

Changed the action to commit and push the updates to the specified version file using the build server `git` command rather than the GitHub API. Same setup as the https://github.com/dolittle/add-to-changelog-action code, with slight changes using environment variables instead of updating the git configuration for the user name and email for committing.

### Changed

- Uses the `git` command to commit and push changes rather than the GitHub API.


