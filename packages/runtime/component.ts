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

type ComponentInstance = {
  props: Data
  attrs: Data
  setupState: any
  ctx: any
  mount: any
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

export function mountComponent(vnode: VNode, container: containerType, anchor?: HTMLElement) {
  const VueInstance = vnode.type as Component
  const instance: ComponentInstance = {
    props: {},
    attrs: {},
    setupState: null,
    ctx: null,
    mount: null,
  }
  initProps(instance, vnode)
  instance.setupState = VueInstance.setup?.(instance.props, { attrs: instance.attrs })
  instance.ctx = {
    ...instance.props,
    ...instance.setupState,
  }

  instance.mount = () => {
    const subTree = normalizeVNode(VueInstance.render(instance.ctx))
    if (Object.keys(instance.attrs).length) {
      subTree.props = {
        ...subTree.props,
        ...instance.attrs,
      }
    }
    patch(null, subTree, container, anchor)
  }
  instance.mount()
}
