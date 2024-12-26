import { childComponentRegistry, registerComponent } from '../childComponentRegistry';
import { getShadowRootModeOrThrow } from '../utils/webComponents';
import { CustomComponentBuilder } from './customComponentBuilder';
import { getWebComponent } from './getWebComponent';

export type ChildComponent = {
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

      if (childComponentRegistry.has(name)) {
        throw new Error(`Duplicate definition found for "${name}"`);
      }

      const component = getWebComponent(child, this.mode);
      registerComponent(name, component);
    }
  }

  getChildComponent = (name: string): ChildComponent | undefined =>
    childComponentRegistry.get(name);

  getChildComponentBuilder = (name: string): CustomComponentBuilder => {
    if (!name) {
      throw new Error('A non-empty "name" is required');
    }

    if (childComponentRegistry.has(name)) {
      throw new Error(`Child component "${name} already exists"`);
    }

    return new CustomComponentBuilder(name);
  };
}
