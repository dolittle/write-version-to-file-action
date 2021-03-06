// Copyright (c) Dolittle. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import * as core from '@actions/core';
import { Logger } from '@dolittle/github-actions.shared.logging';
import * as github from '@actions/github';

import editJsonFile from 'edit-json-file';
import { Octokit } from '@octokit/core';

import * as fs from 'fs';

const logger = new Logger();

async function getCurrentCommit(
    octo: Octokit,
    owner: string,
    repo: string,
    ref: string) {

    const { data: refData } = await octo.git.getRef({
        owner,
        repo,
        ref,
    });

    const commitSha = refData.object.sha;
    const { data: commitData } = await octo.git.getCommit({
        owner: owner,
        repo,
        commit_sha: commitSha,
    });

    return {
        commitSha,
        treeSha: commitData.tree.sha,
    };
}

async function createNewTree(
    octo: Octokit,
    owner: string,
    repo: string,
    blobs: any[],
    paths: string[],
    parentTreeSha: string) {

    // My custom config. Could be taken as parameters
    const tree = blobs.map(({ sha }, index) => ({
        path: paths[index],
        mode: '100644',
        type: 'blob',
        sha,
    }));

    const { data } = await octo.git.createTree({
        owner,
        repo,
        tree,
        base_tree: parentTreeSha,
    });

    return data;
}

const getFileAsUTF8 = (filePath: string) => fs.promises.readFile(filePath, 'utf8');

async function createBlobForFile(octo: Octokit, org: string, repo: string, filePath: string) {
    const content = await getFileAsUTF8(filePath);
    const blobData = await octo.git.createBlob({
        owner: org,
        repo,
        content,
        encoding: 'utf-8',
    });

    return blobData.data;
}

run();
export async function run() {
    try {
        const path = core.getInput('path', { required: true });
        const version = core.getInput('version', { required: true });
        const token = core.getInput('token', { required: true });

        logger.info(`Path : ${path}`);
        logger.info(`Version: ${version}`);

        const octokit = github.getOctokit(token);

        const currentRepo = github.context.repo;
        const currentRef = github.context.ref.replace('refs/', '');

        logger.info(`Current repo ${currentRepo.owner} - ${currentRepo.repo}`);

        const file = editJsonFile(path);
        file.set('version', version);
        file.set('commit', github.context.sha);
        file.set('built', new Date().toISOString());
        file.save();

        const currentCommit = await getCurrentCommit(octokit, currentRepo.owner, currentRepo.repo, currentRef);

        const blob = await createBlobForFile(octokit, currentRepo.owner, currentRepo.repo, path);

        const tree = await createNewTree(octokit, currentRepo.owner, currentRepo.repo, [blob], [path], currentCommit.treeSha);
        const newCommit = await octokit.git.createCommit({
            owner: currentRepo.owner,
            repo: currentRepo.repo,
            message: 'Updating version information',
            tree: tree.sha,
            parents: [currentCommit.commitSha]
        });

        await octokit.git.updateRef({
            owner: currentRepo.owner,
            repo: currentRepo.repo,
            ref: currentRef,
            sha: newCommit.data.sha
        });

        logger.info('Version updated, written and committed');
    } catch (error) {
        logger.info(`Error : ${error}`);
        fail(error);
    }
}

function fail(error: Error) {
    logger.error(error.message);
    core.setFailed(error.message);
}
