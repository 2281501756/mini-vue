import { Component } from './component'
import { render } from './render'
import { h } from './vnode'

export function createApp(rootComponent: Component) {
  const app = {
    mount(container: HTMLElement | null) {
      render(h(rootComponent), container)
    },
  }
  return app
}
