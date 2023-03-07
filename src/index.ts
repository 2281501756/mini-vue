import { h, render, Text, Fragment } from '../packages/runtime'

const vnode = h(
  'div',
  {
    class: 'a b',
    style: {
      backgroundColor: 'red',
      width: '100px',
      height: '100px',
    },
  },
  [h('ul', null, [h('li', null, 1), h('li', null, 2), h('li', null, 3), h('li', null, 4)])]
)

render(vnode, document.getElementById('app') as HTMLElement)
