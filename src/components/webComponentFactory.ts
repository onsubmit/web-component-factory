import { getWebComponent } from './getWebComponent';

export class WebComponentFactory extends HTMLElement {
  static observedAttributes = [];

  connectedCallback(): void {
    const defaultMode = this.getAttribute('#mode') || 'closed';
    for (const child of [...this.children]) {
      if (child.tagName !== 'WC') continue;

      const name = child.getAttribute('#name');
      const extends_ = child.getAttribute('#extends');
      if (!name) {
        throw new Error('"name" attribute is required');
      }

      customElements.define(
        name,
        getWebComponent(child, defaultMode),
        extends_ ? { extends: extends_ } : undefined,
      );
    }
  }
}
