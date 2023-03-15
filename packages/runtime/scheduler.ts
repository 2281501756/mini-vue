const queue: any[] = []
let isFlushing = false
const resolvedPromise = Promise.resolve()
let currentFlushPromise: null | Promise<any> = null

export function nextTick(callback: any) {
  const p = currentFlushPromise || resolvedPromise
  return callback ? p.then(callback) : p
}
export function queueJob(job: any) {
  if (!queue.includes(job)) {
    queue.push(job)
    queueFlush()
  }
}

function queueFlush() {
  if (!isFlushing) {
    isFlushing = true
    currentFlushPromise = resolvedPromise.then(flushJob)
  }
}
function flushJob() {
  try {
    for (let i = 0; i < queue.length; i++) {
      const job = queue[i]
      job()
    }
  } finally {
    isFlushing = false
    currentFlushPromise = null
    queue.length = 0
  }
}
