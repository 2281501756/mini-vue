let actionEffect: null | Function = null
export function effect<T>(fn: () => T) {
  const effectFn = () => {
    try {
      actionEffect = fn
      fn()
    } finally {
      actionEffect = null
      return
    }
  }
  effectFn()
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
    effectFn()
  })
}
