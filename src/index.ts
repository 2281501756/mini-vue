import { h, render, Text, Fragment } from '../packages/runtime'
import { ref } from '../packages/reactivity'

const com = {
  props: ['foo'],
  setup() {
    const count = ref(0)
    const add = () => {
      count.value++
    }
    const sub = () => {
      count.value--
    }
    return {
      count,
      add,
      sub,
    }
  },
  render(ctx: any) {
    console.log('render')
    return h('div', null, [
      h('div', null, ctx.count.value),
      h('button', { onClick: ctx.add }, '+'),
      h('button', { onClick: ctx.sub }, '-'),
    ])
  },
}

render(h(com, { foo: 'foo', bar: 'bar' }), document.getElementById('app') as HTMLElement)
