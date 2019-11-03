# Job Dispatcher

When you don't create all jobs equally but they do similar jobs, use `job-dispatcher` to easily dispatch the tasks. This pool of workers is very useful when you have uniquely defined workers. 

## Quick Start

### Prepare the dispatcher's pool with workers
This is an example of a 2-worker pool. Each worker will return a greeting but the one will return a greeting in English and the other in Spanish. When running the process through the pool the pool will select an available pool to run. The consumer might experience this as random.

```javascript
const dispatcher = require('job-dispatcher').create()

// prepare the workers
dispatcher.addWorker(async ({name, gender}) => {
    const salutation = gender === 'm' ? 'Mr' : 'Mrs'
    return `Hello, ${salutation} {name}`
})

dispatcher.addWorker(async ({name, gender}) => {
    const salutation = gender === 'm' ? 'Señor' : 'Señora'
    return `Hola, ${salutation} {name}`
})
```

Prepare data for this demonstration:

```javascript
// prepare data
const data =[ 
    { name: 'Heisenberg', gender: 'm' },
    { name: 'Wrexler', gender: 'f' },
    { name: 'Bruin', gender: 'f' },
    { name: 'Trop', gender: 'm' },
    { name: 'Fring', gender: 'm' } 
]
```

### No-Wait Processing
The simplest way to run the process from the pool is just invoke `run`. Successful invocation will go without any error thrown.  

```javascript
// process data from pool
data.forEach(async d => {
    try {
        // pick an available worker from the pool and run the process
        const msg = await dispatcher.run(d)
        console.log(msg) // will salute in English or Spanish (randomly)
    } catch (err) {
        // when all workers are busy, an error will be thrown
        // This is the 1st style.
        if (err.WorkerNotAvailable) console.error('All workers are busy.')
        console.error(err)
    }
})
```

### Waiting Process

To let the pool to wait for an available worker and the execute the process, give the option `wait: true` and the timeout `timeout: <milliseconds>`. The wait option is defaulted to `false` obviously and `timeout` is defaulted to `5000` (5 seconds). Of course the `timeout` is ignored when `wait: false`. If the timeout is passed and there is still no worker is available, the `WorkerNotAvailableError` will be thrown.

```javascript
data.forEach(async d => {
    // wait for an available worker for max 2000 msecs
    // and then run the process
    try {
        const msg = await dispatcher.run(d, { wait: true, timeout: 2000} )
        console.log(msg) // will salute in English or Spanish (randomly)
    } catch (err) {
        // 2nd style of catching running out of workers
        if (typeof err === 'WorkerNotAvailableError')
            console.error('All workers are busy.')
    }
})
```