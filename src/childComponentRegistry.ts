import { ChildComponent } from './components/webComponentFactory';

const childComponentRegistry = new Map<string, ChildComponent>();

export function registerComponent(name: string, component: ChildComponent): void {
  childComponentRegistry.set(name, component);
  customElements.define(name, component.constructor);
}

export { childComponentRegistry };
