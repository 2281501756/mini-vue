import { reactive } from '../packages/reactivity/reactive'
import { effect } from '../packages/reactivity/effect'

declare global {
  interface Window {
    a: any
    observer: any
  }
}

let a = reactive({
  value: 1,
})
effect(() => {
  console.log('我是effect中的  a:', a.value)
})

let observer = reactive({
  arr: [1, 2, 3],
})
effect(() => {
  console.log('observer length  ' + observer.arr.length)
})
effect(() => {
  console.log('数组改变了', observer.arr[0])
})

window.a = a
window.observer = observer
