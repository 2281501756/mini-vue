import { VNode, ShapeFlags } from './vnode'
import { isSameVNode } from './vnode'
import { patchProps } from './patchProps'

type containerType = HTMLElement & {
  _vnode?: VNode | null
}

export function render(vode: VNode, container: containerType | null) {
  if (!container) {
    throw new Error('挂载节点不能为空')
  }
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
    patchChildren(n1, n2, container, fragmentEndAnchor)
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
      if (prevChildren[0] && prevChildren[0].key && children[0] && children[0].key) {
        patchKeyedChilren(prevChildren, children, container, anchor)
      } else {
        patchUnkeyedChildren(prevChildren, children, container, anchor)
      }
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
function patchUnkeyedChildren(c1: any[], c2: any[], container: containerType, anchor: HTMLElement) {
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

function patchKeyedChilren(c1: any[], c2: any[], container: containerType, anchor: HTMLElement) {
  let i = 0,
    e1 = c1.length - 1,
    e2 = c2.length - 1
  // 1从左至右依次对比
  while (i <= e1 && i <= e2 && c1[i].key === c2[i].key) {
    patch(c1[i], c2[i], container, anchor)
    i++
  }
  // 2从右至左依次对比
  while (i <= e1 && i <= e2 && c1[e1].key === c2[e2].key) {
    patch(c1[e1], c2[e2], container, anchor)
    e1--
    e2--
  }
  if (i > e1) {
    // 3 只剩下新的没有挂载的节点
    const nextPos = e2 + 1
    const curAnchor = (c2[nextPos] && c2[nextPos].el) || anchor
    for (let j = i; j <= e2; j++) {
      patch(null, c2[j], container, curAnchor)
    }
  } else if (i > e2) {
    // 4 只剩下之前的没有卸载
    for (let j = i; j <= e1; j++) {
      unmount(c1[j])
    }
  } else {
    // 5 采用传统的diff方法去遍历只是对需要移动和删除的进行标签
    const map = new Map()
    for (let j = i; j <= e1; j++) {
      const prev = c1[j]
      map.set(c1[j].key, { prev, j })
    }
    let maxNewIndexSoFar = 0,
      move = false
    const source = new Array(e2 - i + 1).fill(-1),
      toMounted = []
    for (let k = i; k <= e2; k++) {
      const next = c2[k]
      if (map.has(next.key)) {
        const { prev, j } = map.get(next.key)
        patch(prev, next, container, anchor)
        if (j < maxNewIndexSoFar) {
          move = true
        } else {
          maxNewIndexSoFar = j
        }
        source[k - i] = j
        map.delete(next.key)
      } else {
        toMounted.push(k)
      }
    }
    map.forEach(({ prev }) => {
      unmount(prev)
    })
    console.log(move)
    // 和最长递增子序列进行对比 进行移动 添加
    if (move) {
      const seq = getSequence(source)
      let j = seq.length - 1
      for (let k = source.length - 1; k >= 0; k--) {
        if (seq[j] == k) {
          j--
        } else {
          const pos = k + i
          const nextPos = pos + 1
          const curAnchor = (c2[nextPos] && c2[nextPos].el) || anchor
          if (source[k] === -1) {
            patch(null, c2[pos], container, curAnchor)
          } else {
            container.insertBefore(c2[pos].el, curAnchor)
          }
        }
      }
    } else if (toMounted.length) {
      for (let k = toMounted.length - 1; k >= 0; k--) {
        const pos = toMounted[k]
        const nextPos = pos + 1
        const curAnchor = (c2[nextPos] && c2[nextPos].el) || anchor
        patch(null, c2[pos], container, curAnchor)
      }
    }
  }
}
// 最长公共子序列算法
function getSequence(nums: number[]): number[] {
  const result = []
  const position = []
  for (let i = 0; i < nums.length; i++) {
    if (nums[i] === -1) {
      continue
    }
    // result[result.length - 1]可能为undefined，此时nums[i] > undefined为false
    if (nums[i] > result[result.length - 1]) {
      result.push(nums[i])
      position.push(result.length - 1)
    } else {
      let l = 0,
        r = result.length - 1
      while (l <= r) {
        const mid = ~~((l + r) / 2)
        if (nums[i] > result[mid]) {
          l = mid + 1
        } else if (nums[i] < result[mid]) {
          r = mid - 1
        } else {
          l = mid
          break
        }
      }
      result[l] = nums[i]
      position.push(l)
    }
  }
  let cur = result.length - 1
  // 这里复用了result，它本身已经没用了
  for (let i = position.length - 1; i >= 0 && cur >= 0; i--) {
    if (position[i] === cur) {
      result[cur--] = i
    }
  }
  return result
}

// 挂载类函数
function mountElement(vode: VNode, container: containerType, anchor: HTMLElement) {
  const { type, props, shapeFlag, children } = vode
  const el: containerType = document.createElement(type)
  patchProps(null, props, el)
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

// 传统diff
// function patchKeyedChilren(c1: any[], c2: any[], container: containerType, anchor: HTMLElement) {
//    let maxNewIndexSoFar = 0
//   const map = new Map()
//   c1.forEach((prev, j) => {
//     map.set(prev.key, { prev, j })
//   })
//   for (let i = 0; i < c2.length; i++) {
//     const next = c2[i]
//     const curAnchor = i === 0 ? c1[0].el : c2[i - 1].el.nextSibling
//     if (map.has(next.key)) {
//       const { prev, j } = map.get(next.key)
//       patch(prev, next, container, anchor)
//       if (j < prev) {
//         container.insertBefore(next.el, curAnchor)
//       } else {
//         maxNewIndexSoFar = j
//       }
//       map.delete(next.key)
//     } else {
//       patch(null, next, container, curAnchor)
//     }
//   }
//   map.forEach(({ prev }) => {
//     unmount(prev)
//   })
// }
