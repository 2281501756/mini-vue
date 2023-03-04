import { reactive } from '../packages/reactivity/reactive'
import { effect } from '../packages/reactivity/effect'

declare global {
  interface Window {
    a: any
  }
}

window.a = reactive({
  value: 1,
})
effect(() => {
  console.log('我是effect中的  a:', window.a.value)
})
