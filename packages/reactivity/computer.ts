import { isFunction } from '../utils/index'
import { effect, track, trigger } from './effect'

export function computer(getterOrOption: any) {
  let getter, setter
  if (isFunction(getterOrOption)) {
    getter = getterOrOption
    setter = () => {
      throw new Error('不能修改')
    }
  } else {
    getter = getterOrOption.get
    setter = getterOrOption.set
  }
  return new ComputerImpl(getter, setter)
}

class ComputerImpl {
  private _setter: Function
  private _value: any
  private effect: Function
  private _dirty: boolean
  constructor(getter: Function, setter: Function) {
    this._setter = setter
    this._dirty = true
    this.effect = effect(getter as any, {
      lazy: true,
      scheduler: () => {
        if (!this._dirty) {
          this._dirty = true
          trigger(this, 'value')
        }
      },
    })
  }
  get value() {
    if (this._dirty) {
      this._value = this.effect()
      this._dirty = false
      track(this, 'value')
    }
    return this._value
  }
  set value(val) {
    this._setter(val)
  }
}
