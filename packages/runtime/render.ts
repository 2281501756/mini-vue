import { VNode, ShapeFlags } from './vnode'
import { isSameVNode } from './vnode'
import { patchProps } from './patchProps'

type containerType = HTMLElement & {
  _vnode?: VNode | null
}

export function render(vode: VNode, container: containerType) {
  const prevVNode = container._vnode || null
  if (!vode) {
    if (prevVNode) {
      unmount(prevVNode)
    }
  } else {
    patch(prevVNode, vode, container)
  }
  container._vnode = vode
}

function patch(n1: VNode | null, n2: VNode, container: containerType, anchor?: HTMLElement) {
  if (n1 && !isSameVNode(n1, n2)) {
    unmount(n1)
    anchor = n1.anchor as HTMLElement
    n1 = null
  }
  if (!anchor) anchor = n2.el?.nextSibling as HTMLElement
  const { shapeFlag } = n2
  if (shapeFlag & ShapeFlags.COMPONENT) {
    processComponent(n1, n2, container, anchor)
  } else if (shapeFlag & ShapeFlags.TEXT) {
    processText(n1, n2, container, anchor)
  } else if (shapeFlag & ShapeFlags.FRAGMENT) {
    processFragment(n1, n2, container, anchor)
  } else {
    processElement(n1, n2, container, anchor)
  }
}

function processComponent(
  n1: VNode | null,
  n2: VNode,
  container: containerType,
  anchor: HTMLElement
) {}
function processText(n1: VNode | null, n2: VNode, container: containerType, anchor: HTMLElement) {
  if (n1) {
    n2.el = n1.el
    n2.el && (n2.el.textContent = n2.children)
  } else {
    mountTextNode(n2, container, anchor)
  }
}
function processFragment(
  n1: VNode | null,
  n2: VNode,
  container: containerType,
  anchor: HTMLElement
) {
  const fragmentStartAnchor = (n2.el = (
    n1?.el ? n1.el : document.createTextNode('')
  ) as HTMLElement)
  const fragmentEndAnchor = (n2.anchor = (
    n1?.anchor ? n1.anchor : document.createTextNode('')
  ) as HTMLElement)
  if (n1) {
    patchChildren(n1, n2, container, anchor)
  } else {
    container.insertBefore(fragmentStartAnchor, anchor)
    container.insertBefore(fragmentEndAnchor, anchor)
    mountChildren(n2.children, container, fragmentEndAnchor)
  }
}
function processElement(
  n1: VNode | null,
  n2: VNode,
  container: containerType,
  anchor: HTMLElement
) {
  if (n1) {
    patchElement(n1, n2, anchor)
  } else {
    mountElement(n2, container, anchor)
  }
}

function patchElement(n1: VNode, n2: VNode, anchor: HTMLElement) {
  n2.el = n1.el
  patchProps(n1.props, n2.props, n2.el as HTMLElement)
  patchChildren(n1, n2, n2.el as containerType, anchor)
}
function patchChildren(n1: VNode, n2: VNode, container: containerType, anchor: HTMLElement) {
  const { shapeFlag: prevShapeFlag, children: prevChildren } = n1
  const { shapeFlag, children } = n2

  if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
      container.textContent = children
    } else if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      unmountChildren(prevChildren)
      container.textContent = children
    } else {
      container.textContent = children
    }
  } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
      container.textContent = ''
      mountChildren(children, container, anchor)
    } else if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      patchArrayChilren(prevChildren, children, container, anchor)
    } else {
      mountChildren(children, container, anchor)
    }
  } else {
    if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
      container.textContent = ''
    } else if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      unmountChildren(prevChildren)
    }
  }
}
function patchArrayChilren(c1: any[], c2: any[], container: containerType, anchor: HTMLElement) {
  const oldLength = c1.length
  const newLength = c2.length
  const comenLength = Math.min(oldLength, newLength)
  for (let i = 0; i < comenLength; i++) {
    patch(c1[i], c2[i], container, anchor)
  }
  if (oldLength > newLength) {
    unmountChildren(c1.slice(comenLength))
  }
  if (oldLength < newLength) {
    mountChildren(c2.slice(comenLength), container, anchor)
  }
}

// 挂载类函数
function mountElement(vode: VNode, container: containerType, anchor: HTMLElement) {
  const { type, props, shapeFlag, children } = vode
  const el: containerType = document.createElement(type)
  patchProps(null, props, container)
  if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    el.textContent = children
  } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    mountChildren(children, el, anchor)
  }
  vode.el = el
  container.insertBefore(el, anchor)
}
function mountTextNode(vode: VNode, container: containerType, anchor: HTMLElement) {
  const textNode = document.createTextNode(vode.children)
  container.insertBefore(textNode, anchor)
}
function mountChildren(children: any, container: containerType, anchor: HTMLElement) {
  children.forEach((child: any) => {
    patch(null, child, container, anchor)
  })
}
// 卸载类函数
function unmount(vnode: VNode) {
  const { shapeFlag, el } = vnode
  if (shapeFlag & ShapeFlags.COMPONENT) {
    unmountComponent(vnode)
  } else if (shapeFlag & ShapeFlags.FRAGMENT) {
    unmountFragment(vnode)
  } else {
    el?.parentNode?.removeChild(el)
  }
}

function unmountComponent(vnode: VNode) {}
function unmountFragment(vnode: VNode) {
  let { el: cur, anchor: end } = vnode
  while (cur !== end && cur && end) {
    const next = cur.nextSibling
    if (cur.parentNode) cur.parentNode.removeChild(cur)
    cur = next as HTMLElement
  }
  if (end?.parentNode) end.parentNode.removeChild(end)
}
function unmountChildren(children: any) {
  children.forEach((child: any) => {
    unmount(child)
  })
}
