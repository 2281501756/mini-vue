let actionEffect: undefined | Function
const effectStack: Function[] = []
export function effect<T>(
  fn: () => T,
  option?: {
    lazy?: boolean
    scheduler?: Function
  }
) {
  const effectFn = () => {
    try {
      actionEffect = effectFn
      effectStack.push(actionEffect)
      return fn()
    } finally {
      effectStack.pop()
      actionEffect = effectStack[effectStack.length - 1]
    }
  }
  if (!option?.lazy) {
    effectFn()
  }
  effectFn.scheduler = option?.scheduler
  return effectFn
}

const targetMap = new WeakMap<any, Map<any, Set<any>>>()
export function track(target: any, key: string | Symbol) {
  if (!actionEffect) return
  let depMap = targetMap.get(target)
  if (!depMap) targetMap.set(target, (depMap = new Map()))
  let deps = depMap.get(key)
  if (!deps) depMap.set(key, (deps = new Set()))
  deps.add(actionEffect)
}

export function trigger(target: any, key: string | Symbol) {
  let deps = targetMap.get(target)
  if (!deps) return
  let dep = deps.get(key)
  if (!dep) return
  dep.forEach((effectFn) => {
    if (effectFn.scheduler) {
      effectFn.scheduler(effectFn)
    } else {
      effectFn()
    }
  })
}
