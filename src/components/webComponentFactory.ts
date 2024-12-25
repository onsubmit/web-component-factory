import { getWebComponent } from './getWebComponent';

export type ChildComponent = {
  constructor: CustomElementConstructor;
  mode: ShadowRootMode;
};

export class WebComponentFactory extends HTMLElement {
  static observedAttributes = [];

  private _components = new Map<string, ChildComponent>();

  connectedCallback(): void {
    const defaultMode = this.getAttribute('#mode') || 'closed';
    for (const child of [...this.children]) {
      if (child.tagName !== 'WC') {
        this.removeChild(child);
        continue;
      }

      const name = child.getAttribute('#name');
      if (!name) {
        throw new Error('"#name" attribute is required');
      }

      if (this._components.has(name)) {
        throw new Error(`Duplicate definition found for "${name}"`);
      }

      const component = getWebComponent(child, defaultMode);
      this._components.set(name, component);
      customElements.define(name, component.constructor);
    }
  }

  getChildComponent = (name: string): ChildComponent | undefined => this._components.get(name);
}
