// Copyright (c) Dolittle. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import * as core from '@actions/core';
import * as github from '@actions/github';
import { exec } from '@actions/exec';
import path from 'path';
import editJsonFile from 'edit-json-file';
import { Logger } from '@dolittle/github-actions.shared.logging';

const logger = new Logger();

run();
export async function run() {
    try {
        const version = core.getInput('version', { required: true });
        const path = core.getInput('path', { required: true });

        const userEmail = core.getInput('user-email', { required: false }) || 'build@dolittle.com';
        const userName = core.getInput('user-name', { required: false }) || 'dolittle-build';
        const mergeStrategy = core.getInput('merge-strategy', { required: false }) || 'merge';

        const commitSHA = github.context.sha;
        const buildDate = new Date().toISOString();

        logger.info('Writing build version information to file');
        logger.info(`\tPath : ${path}`);
        logger.info(`\tVersion: ${version}`);
        logger.info(`\tCommit: ${commitSHA}`);
        logger.info(`\tBuilt: ${buildDate}`);

        updateVersionFile(path, version, commitSHA, buildDate);
        await configureUser(userEmail, userName);
        await configurePull(mergeStrategy);
        await commitVersionFile(path, version, userEmail, userName);
        await pushChanges();

    } catch (error) {
        logger.info(`Error : ${error}`);
        fail(error);
    }
}

function fail(error: Error) {
    logger.error(error.message);
    core.setFailed(error.message);
}

function updateVersionFile(filePath: string, version: string, commitSHA: string, buildDate: string) {
    logger.info(`Updating version file ${filePath}`);
    const file = editJsonFile(filePath);
    file.set('version', version);
    file.set('commit', commitSHA);
    file.set('built', buildDate);
    file.save();
}

async function commitVersionFile(filePath: string, version: string, userEmail: string, userName: string) {
    logger.info(`Adding and committing ${filePath}`);
    await exec('git add', [filePath]);
    await exec(
        'git commit',
        [
            `-m "Update to ${version} in version file"`
        ],
        {
            env: {
                GIT_AUTHOR_NAME: userName,
                GIT_AUTHOR_EMAIL: userEmail,
                GIT_COMMITTER_NAME: userName,
                GIT_COMMITTER_EMAIL: userEmail,
            },
        });
}

async function configureUser(userEmail: string, userName: string) {
    logger.info(`Configuring user with email '${userEmail}' and name '${userName}'`);
    await exec(
        'git config',
        [
            'user.email',
            `"${userEmail}"`
        ],
        { ignoreReturnCode: true });
    await exec(
        'git config',
        [
            'user.name',
            `"${userName}"`
        ],
        { ignoreReturnCode: true });
}

async function configurePull(mergeStrategy: string) {
    logger.info(`Configure git pull as '${mergeStrategy}'`);
    switch (mergeStrategy) {
        case 'rebase':
            await exec(
                'git config',
                [
                    'pull.rebase',
                    'true'
                ]
            );
            break;
        case 'fast-forward':
            await exec(
                'git config',
                [
                    'pull.ff',
                    'only'
                ]
            );
            break;
        case 'merge':
            await exec(
                'git config',
                [
                    'pull.rebase',
                    'false'
                ]
            );
            break;
        default:
            await exec(
                'git config',
                [
                    'pull.rebase',
                    'false'
                ]
            );
    }
}

async function pushChanges() {
    const branchName = path.basename(github.context.ref);
    logger.info(`Pushing changelog to origin ${branchName}`);
    await exec('git pull origin', [branchName]);
    await exec('git push origin', [branchName]);
}
