import { isChange, isObject } from '../utils/index'
import { track, trigger } from './effect'

const proxyMap = new WeakMap()
export function reactive<T extends object>(target: T): T {
  if (!isObject(target)) return target
  if (isReactive(target)) return target
  if (proxyMap.has(target)) return proxyMap.get(target)

  const proxy = new Proxy(target, {
    get(target, key, receiver): any {
      if (key === '__isReactive') return true
      const res = Reflect.get(target, key, receiver)
      track(target, key)
      return isObject(res) ? reactive(res as any) : res
    },
    set(target, key, value, receiver) {
      const oldValue = (target as any)[key]
      const res = Reflect.set(target, key, value, receiver)
      if (isChange(oldValue, value)) {
        trigger(target, key)
      }
      return res
    },
  })
  proxyMap.set(target, proxy)
  return proxy
}

export function isReactive(target: any) {
  return target && target.__isReactive
}
