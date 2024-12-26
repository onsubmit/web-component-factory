import { componentRegistry, registerComponent } from '../componentRegistry';
import { getShadowRootModeOrThrow } from '../utils/webComponents';
import { CustomComponentBuilder } from './customComponentBuilder';
import { getWebComponent } from './getWebComponent';

export type Component = {
  constructor: CustomElementConstructor;
  mode: ShadowRootMode;
};

export class WebComponentFactory extends HTMLElement {
  static observedAttributes = [];

  get mode(): ShadowRootMode {
    return getShadowRootModeOrThrow(this.getAttribute('#mode') || 'closed');
  }

  set mode(value: string) {
    this.setAttribute('#mode', value ? getShadowRootModeOrThrow(value) : 'closed');
  }

  connectedCallback(): void {
    for (const child of [...this.children]) {
      if (child.tagName !== 'WC') {
        this.removeChild(child);
        continue;
      }

      const name = child.getAttribute('#name');
      if (!name) {
        throw new Error('"#name" attribute is required');
      }

      if (componentRegistry.has(name)) {
        throw new Error(`Duplicate definition found for "${name}"`);
      }

      const component = getWebComponent(child, this.mode);
      registerComponent(name, component);
    }
  }

  getComponent = (name: string): Component | undefined => componentRegistry.get(name);

  getComponentBuilder = (name: string): CustomComponentBuilder => {
    if (!name) {
      throw new Error('A non-empty "name" is required');
    }

    if (componentRegistry.has(name)) {
      throw new Error(`Child component "${name} already exists"`);
    }

    return new CustomComponentBuilder(name);
  };
}
