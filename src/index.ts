import { reactive } from '../packages/reactivity/reactive'
import { effect } from '../packages/reactivity/effect'
import { ref } from '../packages/reactivity/ref'
import { computer } from '../packages/reactivity/computer'

declare global {
  interface Window {
    [index: string]: any
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

const count1 = ref(1)
effect(() => {
  console.log('123    ', count1.value)
})
const count = computer(() => {
  console.log('我计算了')
  return count1.value * 2
})
window.a = a
window.observer = observer
window.count1 = count1
window.count = count
