import { LifecycleSignatures } from '../utils/webComponents';

export function getCustomElementConstructor(input: {
  attributes: Record<string, string>;
  lifecycles: Partial<LifecycleSignatures>;
  templateHtml: string;
  mode: ShadowRootMode;
}): CustomElementConstructor {
  const { attributes, lifecycles, templateHtml, mode } = input;

  // TODO: Figure out extending other element types
  return class extends HTMLElement {
    static observedAttributes = [...Object.keys(attributes)];

    private _shadowRoot: ShadowRoot;
    private _templateHtml: string;
    private _attributes = { ...attributes };

    constructor() {
      super();

      this._templateHtml = templateHtml;

      for (const attribute of this.attributes) {
        this._attributes[attribute.name] = attribute.value;
      }

      this._shadowRoot = this.attachShadow({ mode });
      this._shadowRoot.innerHTML = this._getInnerHtmlWithAttributes();
    }

    connectedCallback(): void {
      lifecycles['connected']?.();
    }

    disconnectedCallback(): void {
      lifecycles['disconnected']?.();
    }

    adoptedCallback(): void {
      lifecycles['adopted']?.();
    }

    attributeChangedCallback(name: string, oldValue: string, newValue: string): void {
      lifecycles['attributeChanged']?.(name, oldValue, newValue);

      if (oldValue === newValue) {
        return;
      }

      this._attributes[name] = newValue;
      this._shadowRoot.innerHTML = this._getInnerHtmlWithAttributes();
    }

    private _getInnerHtmlWithAttributes = (): string => {
      const div = document.createElement('div');
      div.innerHTML = this._templateHtml;

      for (const [key, value] of Object.entries(this._attributes)) {
        div.innerHTML = div.innerHTML.replaceAll(`{${key}}`, value);
      }

      return div.innerHTML;
    };
  };
}
