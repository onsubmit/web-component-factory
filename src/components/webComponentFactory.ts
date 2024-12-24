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
        this._getWebComponent(child, defaultMode),
        extends_ ? { extends: extends_ } : undefined,
      );
    }
  }

  private _getWebComponent = (element: Element, defaultMode: string): CustomElementConstructor => {
    const lifecycles: Map<string, string> = extractLifecycles();

    const templateHtml = element.innerHTML;
    const attributes = getAttributes();
    const mode = (element.getAttribute('#mode') || defaultMode).toLocaleLowerCase();
    if (!['open', 'closed'].includes(mode)) {
      throw new Error('"mode" attribute must be "open" or "closed"');
    }

    function extractLifecycles(): Map<string, string> {
      const map: Map<string, string> = new Map();
      const lifecycleNames = ['connected', 'disconnected', 'adopted', 'attributeChanged'];

      const scripts = element.querySelectorAll('script[type="lifecycle"]');
      for (const script of scripts) {
        const lifecycle = script.getAttribute('callback') || '';
        if (!lifecycleNames.includes(lifecycle)) {
          continue;
        }

        if (map.has(lifecycle)) {
          throw new Error(`Lifecycle ${lifecycle} already defined`);
        }

        const funcStr = script.textContent || '';
        map.set(lifecycle, funcStr);
        element.removeChild(script);
      }

      return map;
    }

    function getAttributes(): Record<string, string> {
      return [...element.attributes].reduce<Record<string, string>>((acc, attribute) => {
        acc[attribute.name] = attribute.value;
        return acc;
      }, {});
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
        const callback = lifecycles.get('connected');
        if (callback) {
          eval(`${callback}\n;connectedCallback?.();`);
        }

        this._connected = true;
      }

      disconnectedCallback(): void {
        const callback = lifecycles.get('disconnected');
        if (callback) {
          eval(`${callback}\n;disconnectedCallback?.();`);
        }
      }

      adoptedCallback(): void {
        const callback = lifecycles.get('adopted');
        if (callback) {
          eval(`${callback}\n;adoptedCallback?.();`);
        }
      }

      attributeChangedCallback(name: string, oldValue: string, newValue: string): void {
        const callback = lifecycles.get('attributeChanged');
        if (callback) {
          eval(
            `${callback}\n;attributeChangedCallback?.('${name}', '${oldValue}', '${newValue}');`,
          );
        }

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
}
