import { isObject } from '../utils/index'
import { track, trigger } from './effect'

export function reactive(target: any) {
  if (!isObject(target)) {
    return target
  }
  const proxy = new Proxy(target, {
    get(target, key, receiver) {
      const res = Reflect.get(target, key, receiver)
      track(target, key)
      return res
    },
    set(target, key, value, receiver) {
      const res = Reflect.set(target, key, value, receiver)
      trigger(target, key)
      return res
    },
  })
  return proxy
}
