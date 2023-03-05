import { isObject } from '../utils/index'
import { track, trigger } from './effect'
import { reactive } from './reactive'

export function ref<T>(value: T): RefImpl<T> {
  if (isRef(value)) return value as any
  return new RefImpl(value)
}

class RefImpl<T> {
  private __value: T
  private __isRef: boolean
  constructor(value: T) {
    this.__value = convert(value)
    this.__isRef = true
  }
  get value() {
    track(this, 'value')
    return this.__value
  }
  set value(newValue) {
    if (this.__value === newValue) return
    this.__value = convert(newValue)
    trigger(this, 'value')
  }
}
function convert(value: any) {
  return isObject(value) ? reactive(value) : value
}

export function isRef(value: any) {
  return value && value.__isRef
}
