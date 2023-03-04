import { track, trigger } from './effect'

export function ref<T>(value: T): RefImpl<T> {
  if (isRef(value)) return value as any
  return new RefImpl(value)
}

class RefImpl<T> {
  private __value: T
  private __isRef: boolean
  constructor(value: T) {
    this.__value = value
    this.__isRef = true
  }
  get value() {
    track(this, 'value')
    return this.__value
  }
  set value(newValue) {
    if (this.__value === newValue) return
    this.__value = newValue
    trigger(this, 'value')
  }
}

export function isRef(value: any) {
  return value && value.__isRef
}
