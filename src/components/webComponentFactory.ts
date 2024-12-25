import { getWebComponent } from './getWebComponent';

export class WebComponentFactory extends HTMLElement {
  static observedAttributes = [];

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

      const customElementCtor = getWebComponent(child, defaultMode);
      customElements.define(name, customElementCtor);
    }
  }
}
