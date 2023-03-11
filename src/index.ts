import { h, render, Text, Fragment } from '../packages/runtime'

const vnode = h('ul', null, [
  h('li', { key: 1 }, '1'),
  h('li', { key: 2 }, '2'),
  h('li', { key: 3 }, '3'),
  h('li', { key: 4 }, '4'),
  h('li', { key: 5 }, '5'),
])

render(vnode, document.getElementById('app') as HTMLElement)

setTimeout(() => {
  const vnode1 = h('ul', null, [
    h('li', { key: 2 }, '2'),
    h('li', { key: 3 }, '3'),
    h('li', { key: 1 }, '1'),
    h('li', { key: 4 }, '4'),
    h('li', { key: 5 }, '5'),
  ])

  render(vnode1, document.getElementById('app') as HTMLElement)
}, 1000)

// render(
//   h('div', { style: { height: '100px', width: '100px', backgroundColor: 'red' } }, []),
//   document.getElementById('app')
// )
