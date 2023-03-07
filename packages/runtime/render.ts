import { isBoolean } from '../utils'
import { VNode, ShapeFlags } from './vnode'

const domPropsRE = /[A-Z]|^(value|checked|selected|muted|disabled)$/

export function render(vode: VNode, container: HTMLElement) {
  mount(vode, container)
}

function mount(vode: VNode, container: HTMLElement) {
  const { shapeFlag } = vode
  if (shapeFlag & ShapeFlags.ELEMENT) {
    mountElement(vode, container)
  } else if (shapeFlag & ShapeFlags.TEXT) {
    mountTextNode(vode, container)
  } else if (shapeFlag & ShapeFlags.FRAGMENT) {
    mountFragment(vode, container)
  } else {
    mountComponent(vode, container)
  }
}

function mountElement(vode: VNode, container: HTMLElement) {
  const { type, props } = vode
  const el = document.createElement(type)
  mountProps(props, el)
  mountChildren(vode, el)
  container.appendChild(el)
}
function mountTextNode(vode: VNode, container: HTMLElement) {
  const textNode = document.createTextNode(vode.children)
  container.appendChild(textNode)
}
function mountFragment(vode: VNode, container: HTMLElement) {
  mountChildren(vode, container)
}
function mountComponent(vode: VNode, container: HTMLElement) {}

function mountProps(props: any, el: HTMLElement) {
  for (const key in props) {
    const value = props[key]
    switch (key) {
      case 'class': {
        el.className = value
        break
      }
      case 'style': {
        for (const styleKey in value) {
          el.style[styleKey as any] = value[styleKey]
        }
        break
      }
      default: {
        if (/^on[^a-z]/.test(key)) {
          const eventName = (key as string).slice(2).toLowerCase()
          el.addEventListener(eventName, value)
        } else if (domPropsRE.test(key)) {
          if (value === '' && isBoolean((el as any)[key])) {
            ;(el as any)[key] = true
          } else {
            ;(el as any)[key] = value
          }
        } else {
          if (value == null || value === false) {
            el.removeAttribute(key)
          } else {
            el.setAttribute(key, value)
          }
        }
      }
    }
  }
}
function mountChildren(vode: VNode, container: HTMLElement) {
  const { children, shapeFlag } = vode
  if (!children) return
  if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
    mountTextNode(vode, container)
  } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
    children.forEach((child: any) => {
      mount(child, container)
    })
  }
}
