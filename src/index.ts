import { h, render, Text, Fragment } from '../packages/runtime'
import { ref } from '../packages/reactivity'

const com = {
  props: ['foo'],
  setup() {
    const count = ref(0)
    const add = () => {
      count.value++
      console.log(count.value)
    }
    return {
      count,
      add,
    }
  },
  render(ctx: any) {
    return h('div', { style: { backgroundColor: 'red' }, id: ctx.bar }, [
      h('div', null, ctx.count.value),
      h('button', { onClick: ctx.add }, '+'),
    ])
  },
}

render(h(com, { foo: 'foo', bar: 'bar' }), document.getElementById('app') as HTMLElement)
