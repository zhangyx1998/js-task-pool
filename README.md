# JavaScript Task Pooling

## Installation

+ As runtime dependency

    ```sh
    npm install --save @zhangyx1998/task-pool
    ```

+ As build-time only dependency

    ```sh
    npm install --save-dev @zhangyx1998/task-pool
    ```

+ Just want to try it out?

    ```sh
    npm install @zhangyx1998/task-pool
    ```

## Usage

> Showing [example for ES Module](examples/timer.mjs) | Also abailable: [example for Common JS](examples/timer.cjs)

```js
import Pool from 'task-pool';

// Create a Pool that dispatches up to 10 callbacks at the same time
const pool = new Pool(10);

// This is our pseudo workload
function workload(delay = 1000) {
    return new Promise(resolve => {
        setTimeout(() => resolve(Date.now()), delay)
    })
}

for (let i = 0; i < 100; i++) {
    // Workload should be wrapped in a callback function
    const task = pool.add(() => workload(i * 10 + 1000))
    // Return value pass through
    task.then(ret => console.log(`Task ${i} returns`, ret))
}

// Wait until all tasks are finished
await pool.drain();
console.log(`All tasks done at`, Date.now());
```

## Transparent Design

`Pool.add()` returns a promise (a.k.a `task` in the above example) that resolves upon the conclusion of the corresponding task.

While doing the task scheduling, it allows you to `await` on a specific task. The return value or exception flow are both transparently sent back to each task.

## Does pooling make sense for single threaded language?

> Short answer: _YES!_

#### `Promise.all()` does not care about memory pressure

In the case where each of your workload creates large amount of local data (enclosures), or when your task queue is very long, you can easily run into `node: JavaScript our of memory` issue.

This package will mitigate such problem for you.

> ##### See:
>
> 1. [How can I Interleave / merge async iterables?](https://stackoverflow.com/questions/50585456/how-can-i-interleave-merge-async-iterables) - Stack Overflow
>
> 2. [Node crashes when building default theme - "JavaScript heap out of memory"](https://github.com/vuejs/vitepress/issues/3362) - VitePress issue

## Design choice

This implementation is **intentionally** designed to **NOT** provide a list of all promises. This design allows the user (you) to control when the task enclosure is unreferenced (and subject to garbage-collection).

Otherwise, the promise will hold reference to the resolved value, which in turn may reference huge local variables in task local enclosure.

> #### Still need `Promise.all`?
> 
> You can easily get it:
>
> ```js
> results = await Promise.all(workloads.map(pool.add))
> ```
