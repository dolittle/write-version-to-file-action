// Copyright (c) Dolittle. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import * as core from '@actions/core';
import { Logger } from '@dolittle/github-actions.shared.logging';

const logger = new Logger();

run();
export async function run() {
    try {
        // Put your code in here
    } catch (error) {
        fail(error);
    }
}


function fail(error: Error) {
    logger.error(error.message);
    core.setFailed(error.message);
}
