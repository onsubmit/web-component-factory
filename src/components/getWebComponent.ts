import { getShadowRootModeOrThrow, isLifecycle, LifecycleName } from '../utils/webComponents';

export function getWebComponent(element: Element, defaultMode: string): CustomElementConstructor {
  const lifecycles = extractLifecycles();
  const templateHtml = element.innerHTML;
  const attributes = getAttributes();
  const mode = getShadowRootModeOrThrow(
    (element.getAttribute('#mode') || defaultMode).toLocaleLowerCase(),
  );

  function extractLifecycles(): Map<LifecycleName, string> {
    const map = new Map<LifecycleName, string>();

    const scripts = element.querySelectorAll('script[type="lifecycle"]');
    for (const script of scripts) {
      const lifecycle = script.getAttribute('callback') || '';
      if (!isLifecycle(lifecycle)) {
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

      this._shadowRoot = this.attachShadow({ mode });
      this._shadowRoot.innerHTML = this._getInnerHtmlWithAttributes();
    }

    connectedCallback(): void {
      this._executeLifecycleCallback('connected');
      this._connected = true;
    }

    disconnectedCallback(): void {
      this._executeLifecycleCallback('disconnected');
    }

    adoptedCallback(): void {
      this._executeLifecycleCallback('adopted');
    }

    attributeChangedCallback(name: string, oldValue: string, newValue: string): void {
      this._executeLifecycleCallback(
        'attributeChanged',
        ...[name, oldValue, newValue].map((v) => `'${v}'`),
      );

      if (!this._connected || oldValue === newValue) {
        return;
      }

      this._attributes[name] = newValue;
      this._shadowRoot.innerHTML = this._getInnerHtmlWithAttributes();
    }

    private _executeLifecycleCallback = (name: LifecycleName, ...args: any[]): void => {
      const callback = lifecycles.get(name);
      if (callback) {
        eval(`${callback}\n;${name}Callback?.(${args.join(', ')});`);
      }
    };

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
