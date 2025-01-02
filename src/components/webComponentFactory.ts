import { componentRegistry } from '../componentRegistry';
import { CustomComponentBuilder } from '../customComponentBuilder';
import { DynamicAttributes } from '../dynamicAttributes';
import { getWebComponent } from '../getWebComponent';
import { getShadowRootModeOrThrow } from '../webComponents';
import { WebComponent } from './webComponent';

export type Component = {
  constructor: CustomElementConstructor;
  mode: ShadowRootMode;
};

const otherAllowedChildren = ['TEMPLATE'];

export class WebComponentFactory extends WebComponent {
  static observedAttributes = [];

  private _attributes = new DynamicAttributes({ element: this });

  constructor() {
    super();
    this.style.display = 'none';
  }

  get mode(): ShadowRootMode {
    return getShadowRootModeOrThrow(this.getAttribute('#mode') || 'closed');
  }

  set mode(mode: ShadowRootMode) {
    this.setAttribute('#mode', mode);
  }

  get dynamicAttributes(): DynamicAttributes {
    return this._attributes;
  }

  connectedCallback(): void {
    for (const child of [...this.children]) {
      if (child.tagName === 'WEB-COMPONENT') {
        getWebComponent({
          element: child,
          defaultMode: this.mode,
          initial: this._attributes,
        });
      } else if (!otherAllowedChildren.includes(child.tagName)) {
        this.removeChild(child);
      }
    }
  }

  addTemplate = (template: HTMLTemplateElement): this => {
    this.appendChild(template);
    return this;
  };

  addComponent = (element: HTMLElement): this => {
    if (!(element instanceof WebComponent)) {
      throw new Error(`Element must be a <web-component>. Found: "${element.tagName}".`);
    }

    this.appendChild(element);
    getWebComponent({ element, defaultMode: this.mode, initial: this._attributes });
    return this;
  };

  getComponent = (name: string): Component | undefined => componentRegistry.get(name);

  observeAttribute = (name: string): this => {
    this._updateAttribute(name, true);
    return this;
  };

  ignoreAttribute = (name: string): this => {
    this._updateAttribute(name, false);
    return this;
  };

  getComponentBuilder = (name: string): CustomComponentBuilder => {
    if (!name) {
      throw new Error('A non-empty "name" is required');
    }

    if (componentRegistry.has(name)) {
      throw new Error(`Component "${name}" already exists`);
    }

    return new CustomComponentBuilder(name, this._attributes);
  };

  protected onSetAttribute(qualifiedName: string, value: string): void {
    super.onSetAttribute(qualifiedName, value);
    this._attributes.set(qualifiedName, value);
  }

  private _updateAttribute = (name: string, observed: boolean): void => {
    if (!name) {
      throw new Error('A non-empty "name" is required');
    }

    if (observed) {
      this._attributes.observe(name);
    } else {
      this._attributes.ignore(name);
    }
  };
}
