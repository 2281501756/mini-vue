import { effect } from '../reactivity'
import { reactive } from '../reactivity/reactive'
import { containerType, patch } from './render'
import { normalizeVNode, VNode } from './vnode'

type Data = Record<string, unknown>
export type Component = {
  props: any[]
  render: (ctx: any) => any
  setup?: (
    props: {},
    option: {
      attrs: {}
    }
  ) => any
}

export type ComponentInstance = {
  props: Data
  attrs: Data
  setupState: any
  ctx: any
  update: any
  isMound: boolean
  subTree: any
  next: any
}

function initProps(instance: ComponentInstance, vnode: VNode) {
  const VueInstance = vnode.type as Component,
    VnodeProps = vnode.props
  const props = instance.props
  const attrs = instance.attrs
  for (const key in VnodeProps) {
    if (VueInstance.props.includes(key)) {
      props[key] = VnodeProps[key]
    } else {
      attrs[key] = VnodeProps[key]
    }
  }
  instance.props = reactive(instance.props)
}

// 把组件中的attribute挂载到VNode上
function fallThrough(instance: ComponentInstance, subTree: VNode) {
  if (Object.keys(instance.attrs).length) {
    subTree.props = {
      ...subTree.props,
      ...instance.attrs,
    }
  }
}

export function mountComponent(vnode: VNode, container: containerType, anchor?: HTMLElement) {
  const VueInstance = vnode.type as Component
  const instance: ComponentInstance = (vnode.component = {
    props: {},
    attrs: {},
    setupState: null,
    ctx: null,
    update: null,
    isMound: false,
    subTree: null,
    next: null,
  })
  initProps(instance, vnode)
  instance.setupState = VueInstance.setup?.(instance.props, { attrs: instance.attrs })
  instance.ctx = {
    ...instance.props,
    ...instance.setupState,
  }

  instance.update = effect(() => {
    if (!instance.isMound) {
      const subTree = (instance.subTree = normalizeVNode(VueInstance.render(instance.ctx)))
      fallThrough(instance, subTree)
      patch(null, subTree, container, anchor)
      vnode.el = subTree.el
      instance.isMound = true
    } else {
      if (instance.next) {
        vnode = instance.next
        instance.next = null
        initProps(instance, vnode)
        instance.ctx = {
          ...instance.props,
          ...instance.setupState,
        }
      }
      const prev = instance.subTree
      const subTree = (instance.subTree = normalizeVNode(VueInstance.render(instance.ctx)))
      fallThrough(instance, subTree)
      patch(prev, subTree, container, anchor)
      vnode.el = subTree.el
    }
  })
}
export function updateComponent(n1: VNode, n2: VNode) {
  n2.component = n1.component
  if (n2.component) {
    n2.component.next = n2
    n2.component.update()
  }
}
