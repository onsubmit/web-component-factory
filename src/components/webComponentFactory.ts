export class WebComponentFactory extends HTMLElement {
  static observedAttributes = [];

  connectedCallback(): void {
    for (const child of [...this.children]) {
      if (child.tagName !== 'WC') continue;

      const name = child.getAttribute('#name');
      const extends_ = child.getAttribute('#extends');
      if (!name) {
        throw new Error('"name" attribute is required');
      }

      customElements.define(
        name,
        this._getWebComponent(child),
        extends_ ? { extends: extends_ } : undefined,
      );
    }
  }

  private _getWebComponent = (element: Element): CustomElementConstructor => {
    const templateHtml = element.innerHTML;
    const attributes = this._getAttributes(element);
    const mode = (element.getAttribute('#mode') || 'closed').toLocaleLowerCase();
    if (!['open', 'closed'].includes(mode)) {
      throw new Error('"mode" attribute must be "open" or "closed"');
    }

    return class extends HTMLElement {
      static observedAttributes = [...Object.keys(attributes)];

      private _shadowRoot: ShadowRoot;
      private _templateHtml: string;
      private _connected = false;
      private _attributes = { ...attributes };

      constructor() {
        super();

        this._templateHtml = templateHtml;

        for (const attribute of this.attributes) {
          this._attributes[attribute.name] = attribute.value;
        }

        this._shadowRoot = this.attachShadow({ mode: mode as ShadowRootMode });
        this._shadowRoot.innerHTML = this.getInnerHtmlWithAttributes();
      }

      connectedCallback(): void {
        this._connected = true;
      }

      attributeChangedCallback(name: string, oldValue: string, newValue: string): void {
        if (!this._connected || oldValue === newValue) {
          return;
        }

        this._attributes[name] = newValue;
        this._shadowRoot.innerHTML = this.getInnerHtmlWithAttributes();
      }

      getInnerHtmlWithAttributes = (): string => {
        const div = document.createElement('div');
        div.innerHTML = this._templateHtml;
        for (const [key, value] of Object.entries(this._attributes)) {
          div.innerHTML = div.innerHTML.replaceAll(`{${key}}`, value);
        }

        return div.innerHTML;
      };
    };
  };

  private _getAttributes = (element: Element): Record<string, string> =>
    [...element.attributes].reduce<Record<string, string>>((acc, attribute) => {
      acc[attribute.name] = attribute.value;
      return acc;
    }, {});
}
