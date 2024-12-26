import { componentRegistry } from '../componentRegistry';
import { getShadowRootModeOrThrow } from '../utils/webComponents';
import { CustomComponentBuilder } from './customComponentBuilder';
import { getWebComponent } from './getWebComponent';
import { WebComponent } from './webComponent';

export type Component = {
  constructor: CustomElementConstructor;
  mode: ShadowRootMode;
};

const otherAllowedChildren = ['TEMPLATE'];

export class WebComponentFactory extends WebComponent {
  static observedAttributes = [];

  private _attributes: Record<string, string> = {};

  constructor() {
    super();

    for (const attribute of this.attributes) {
      this._attributes[attribute.name] = attribute.value;
    }
  }

  get mode(): ShadowRootMode {
    return getShadowRootModeOrThrow(this.getAttribute('#mode') || 'closed');
  }

  set mode(mode: ShadowRootMode) {
    this.setAttribute('#mode', mode);
  }

  connectedCallback(): void {
    for (const child of [...this.children]) {
      if (child.tagName === 'WEB-COMPONENT') {
        getWebComponent({
          element: child,
          defaultMode: this.mode,
          globalAttributes: this._attributes,
        });
      } else if (!otherAllowedChildren.includes(child.tagName)) {
        this.removeChild(child);
      }
    }
  }

  addTemplate = (template: HTMLTemplateElement): void => {
    this.appendChild(template);
  };

  addComponent = (element: HTMLElement): void => {
    if (!(element instanceof WebComponent)) {
      throw new Error(`Element must be a <web-component>. Found: "${element.tagName}".`);
    }

    this.appendChild(element);
    getWebComponent({ element, defaultMode: this.mode, globalAttributes: this._attributes });
  };

  getComponent = (name: string): Component | undefined => componentRegistry.get(name);

  getComponentBuilder = (name: string): CustomComponentBuilder => {
    if (!name) {
      throw new Error('A non-empty "name" is required');
    }

    if (componentRegistry.has(name)) {
      throw new Error(`Component "${name}" already exists`);
    }

    return new CustomComponentBuilder(name);
  };
}
