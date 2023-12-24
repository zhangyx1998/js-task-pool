/* ---------------------------------------------------------
 * Copyright (c) 2023 Yuxuan Zhang, web-dev@z-yx.cc
 * This source code is licensed under the MIT license.
 * You may find the full license in project root directory.
 * ------------------------------------------------------ */

// You should first build the project, see README.md for instructions

const Pool = require('task-pool').default;

(async () => {

    // Create a Pool that dispatches up to 10 callbacks at the same time
    const pool = new Pool(10);

    // This is our pseudo workload
    const start = Date.now();
    function workload(delay) {
        return new Promise(resolve => {
            setTimeout(() => resolve(Date.now() - start), delay)
        })
    }

    for (let i = 0; i < 50; i++) {
        // Workload should be wrapped in a callback function
        const task = pool.add(() => workload(1000 - i * 10))
        // Return value pass through
        task.then(ret => console.log(`Task ${i} returns`, ret))
    }

    // Wait until all tasks are finished
    await pool.drain();
    console.log(`All tasks done at`, Date.now() - start, 'ms');

})()