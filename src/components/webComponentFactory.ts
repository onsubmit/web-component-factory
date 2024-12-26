import { componentRegistry } from '../componentRegistry';
import { getShadowRootModeOrThrow } from '../utils/webComponents';
import { CustomComponentBuilder } from './customComponentBuilder';
import { getWebComponent } from './getWebComponent';
import { WebComponent } from './webComponent';

export type Component = {
  constructor: CustomElementConstructor;
  mode: ShadowRootMode;
};

const allowedChildTags = ['WEB-COMPONENT', 'TEMPLATE'];

export class WebComponentFactory extends WebComponent {
  static observedAttributes = [];

  get mode(): ShadowRootMode {
    return getShadowRootModeOrThrow(this.getAttribute('#mode') || 'closed');
  }

  set mode(mode: ShadowRootMode) {
    this.setAttribute('#mode', mode);
  }

  connectedCallback(): void {
    for (const child of [...this.children]) {
      if (!allowedChildTags.includes(child.tagName)) {
        this.removeChild(child);
        continue;
      }

      if (child.tagName === 'WEB-COMPONENT') {
        getWebComponent(child, this.mode);
      }
    }
  }

  addTemplate = (template: HTMLTemplateElement): void => {
    this.appendChild(template);
  };

  addComponent = (element: HTMLElement): void => {
    if (!(element instanceof WebComponent)) {
      throw new Error('Element must be a <web-component>');
    }

    this.appendChild(element);
    getWebComponent(element, this.mode);
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
