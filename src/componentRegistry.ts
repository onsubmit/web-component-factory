import { Component } from './components/webComponentFactory';

const componentRegistry = new Map<string, Component>();

export function registerComponent(name: string, component: Component): void {
  componentRegistry.set(name, component);
  customElements.define(name, component.constructor);
}

export { componentRegistry };
