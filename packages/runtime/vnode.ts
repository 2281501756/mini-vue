import { isArray, isObject, isString } from '../utils'
import { isReactive } from '../reactivity/reactive'
import { Component } from './component'

export type VNode = {
  type: string | typeof Text | typeof Fragment | Component
  props: any
  children: any
  shapeFlag: number
  el: null | HTMLElement
  anchor: null | HTMLElement
  key: any
}

export const Text = Symbol('Text')
export const Fragment = Symbol('Fragment')

export const ShapeFlags = {
  ELEMENT: 1,
  TEXT: 1 << 1,
  FRAGMENT: 1 << 2,
  COMPONENT: 1 << 3,
  TEXT_CHILDREN: 1 << 4,
  ARRAY_CHILDREN: 1 << 5,
  CHILDREN: (1 << 4) | (1 << 5),
}

export function h(type: any, props: any = null, children: any = null): VNode {
  let shapeFlag = 0
  if (isString(type)) {
    shapeFlag = ShapeFlags.ELEMENT
  } else if (type === Text) {
    shapeFlag = ShapeFlags.TEXT
  } else if (type === Fragment) {
    shapeFlag = ShapeFlags.FRAGMENT
  } else {
    shapeFlag = ShapeFlags.COMPONENT
  }

  if (typeof children === 'string' || typeof children === 'number') {
    shapeFlag |= ShapeFlags.TEXT_CHILDREN
    children = children.toString()
  } else if (Array.isArray(children)) {
    shapeFlag |= ShapeFlags.ARRAY_CHILDREN
  }

  if (props) {
    if (isReactive(props)) {
      props = Object.assign({}, props)
    }
    if (isReactive(props.style)) {
      props.style = Object.assign({}, props.style)
    }
  }

  return {
    type,
    props,
    children,
    shapeFlag,
    el: null,
    anchor: null,
    key: props && (props.key != null ? props.key : null),
  }
}
export function isSameVNode(n1: VNode, n2: VNode) {
  return n1.type === n2.type
}

export function normalizeVNode(vnode: VNode): VNode {
  if (isArray(vnode)) {
    return h(Fragment, null, vnode)
  } else if (isObject(vnode)) {
    return vnode
  } else {
    return h(Text, null, String(vnode))
  }
}
