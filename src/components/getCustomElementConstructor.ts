import { LifecycleCallbacks } from '../utils/webComponents';

export function getCustomElementConstructor(input: {
  attributes: Record<string, string>;
  lifecycles: Partial<LifecycleCallbacks>;
  template: Element | undefined;
  mode: ShadowRootMode;
}): CustomElementConstructor {
  const { attributes, lifecycles, template, mode } = input;

  // TODO: Figure out extending other element types
  return class extends HTMLElement {
    static observedAttributes = [...Object.keys(attributes)];

    private _shadowRoot: ShadowRoot;
    private _templateHtml: string;
    private _attributes = { ...attributes };

    constructor() {
      super();

      if (template instanceof HTMLTemplateElement) {
        this._templateHtml = template.innerHTML;
      } else {
        this._templateHtml = template?.outerHTML ?? '';
      }

      for (const attribute of this.attributes) {
        this._attributes[attribute.name] = attribute.value;
      }

      for (const key1 of Object.keys(this._attributes)) {
        for (const key2 of Object.keys(this._attributes)) {
          if (key1 === key2) {
            continue;
          }
          this._attributes[key1] = this._attributes[key1].replaceAll(
            `{${key2}}`,
            this._attributes[key2],
          );
        }
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
