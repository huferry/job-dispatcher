
class WorkerNotAvailableError extends Error {

    constructor() {
        super('All workers are busy.')
        this.name = 'WorkerNotAvailableError'
    }

    get WorkerNotAvailable() {
        return true
    } 
}

const create = () => {
    const pool = {}
    const workers = []

    tryClaimWorker = () => {
        const available = workers.filter(w => !w.busy)
        if (available.length > 0) {
            available[0].busy = true
            return available[0]
        }
    }

    claimWorker = (options) => {
        const wait = options && options.wait || false
        let timeout = wait ? options && options.timeout || 5000 : 0

        const worker = tryClaimWorker()
        if (!wait || worker) return new Promise((resolve, reject) => {
            if (worker) resolve(worker)
            else reject(new WorkerNotAvailableError())
        })

        return new Promise((resolve, reject) => {
            const loopInterval = 100
            const handleId = setInterval(() => {
                const worker = tryClaimWorker()
                if (worker) {
                    clearInterval(handleId)
                    resolve(worker)
                } else {
                    timeout -= loopInterval
                    if (timeout <= 0) {
                        clearInterval(handleId)
                        reject(new WorkerNotAvailableError())
                    }
                }
            }, loopInterval)
        })
    }

    pool.addWorker = (workerFn) => {
        workers.push({
            busy: false,
            fn: workerFn
        })
        return pool
    }

    pool.run = async (arg, options) => {

        const worker = await claimWorker(options)
        try {
            return await worker.fn(arg)
        } finally {
            worker.busy = false
        }
    }


    return pool
}


module.exports = { create }