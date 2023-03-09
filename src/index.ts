import { h, render, Text, Fragment } from '../packages/runtime'

const vnode = h('ul', null, [h('li', null, 'first'), h(Fragment, null, []), h('li', null, 'last')])

render(vnode, document.getElementById('app') as HTMLElement)

setTimeout(() => {
  const vnode1 = h('ul', null, [
    h('li', null, 'first1231231'),
    h(Fragment, null, [h('li', null, 'add')]),
    h('li', null, 'last'),
  ])
  render(vnode1, document.getElementById('app') as HTMLElement)
}, 1000)
