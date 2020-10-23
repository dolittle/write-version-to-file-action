import * as core from '@actions/core';
import * as github from '@actions/github';
import { Octokit } from '@octokit/core';
import * as fs from 'fs';



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


(async () => {
    const token = '8938e636d82a1859ac00f0b26220a32ec4530129';
    const org = 'dolittle';
    const repo = 'Flokk-Shepherd';

    const octo = github.getOctokit(token);

    const result = await getCurrentCommit(octo, org, repo, 'heads/master');
})();

