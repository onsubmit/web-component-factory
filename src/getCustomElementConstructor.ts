import { DynamicAttributes } from './dynamicAttributes';
import { LifecycleCallbacks } from './webComponents';

export function getCustomElementConstructor(input: {
  attributes: DynamicAttributes;
  lifecycles: Partial<LifecycleCallbacks>;
  template: Element | undefined;
  mode: ShadowRootMode;
}): CustomElementConstructor {
  const { attributes, lifecycles, template, mode } = input;

  // TODO: Figure out extending other element types
  return class extends HTMLElement {
    static observedAttributes = attributes.observedAttributes;

    private _shadowRoot: ShadowRoot;
    private _templateHtml: string;
    private _attributes = new DynamicAttributes({ element: this, initial: attributes });

    constructor() {
      super();

      if (template instanceof HTMLTemplateElement) {
        this._templateHtml = template.innerHTML;
      } else {
        this._templateHtml = template?.outerHTML ?? '';
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

      this._attributes.set(name, newValue);
      this._shadowRoot.innerHTML = this._getInnerHtmlWithAttributes();
    }

    private _getInnerHtmlWithAttributes = (): string => {
      const div = document.createElement('div');
      div.innerHTML = this._templateHtml;

      for (const [key, { value }] of this._attributes.entries()) {
        div.innerHTML = div.innerHTML.replaceAll(`{${key}}`, value);
      }

      return div.innerHTML;
    };
  };
}
