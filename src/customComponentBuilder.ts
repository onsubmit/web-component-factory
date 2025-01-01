import { componentRegistry } from './componentRegistry';
import { Component } from './components/webComponentFactory';
import { DynamicAttributes } from './dynamicAttributes';
import { getCustomElementConstructor } from './getCustomElementConstructor';
import { LifecycleCallback, LifecycleCallbacks, LifecycleName } from './webComponents';

export class CustomComponentBuilder {
  private _name: string;
  private _mode: ShadowRootMode;
  private _child: Element | undefined;
  private _attributes: DynamicAttributes;
  private _lifecycles: Partial<LifecycleCallbacks>;

  constructor(name: string, initial?: DynamicAttributes) {
    this._name = name;
    this._mode = 'closed';
    this._attributes = new DynamicAttributes({ initial });
    this._lifecycles = {};
  }

  setMode = (mode: ShadowRootMode): this => {
    this._mode = mode;
    return this;
  };

  setAttribute = (name: string, value: string): this => {
    if (!name) {
      throw new Error('A non-empty "name" is required');
    }

    this._attributes.set(name, value);
    return this;
  };

  setAttributes = (attributes: DynamicAttributes): this => {
    for (const [name, attribute] of attributes.entries()) {
      this._attributes.set(name, attribute.value);
      if (attribute.observed) {
        this.observeAttribute(name);
      } else {
        this.ignoreAttribute(name);
      }
    }

    return this;
  };

  observeAttribute = (name: string): this => {
    this._attributes.observe(name);
    return this;
  };

  ignoreAttribute = (name: string): this => {
    this._attributes.ignore(name);
    return this;
  };

  setChildElement = (child: Element | undefined): this => {
    this._child = child;
    return this;
  };

  setLifecycleCallback = <T extends LifecycleName>(
    name: T,
    callback: LifecycleCallback<T>,
  ): this => {
    this._lifecycles[name] = callback as LifecycleCallbacks[T];
    return this;
  };

  setLifecycleCallbacks = (callbacks: Partial<LifecycleCallbacks>): this => {
    this._lifecycles = callbacks;
    return this;
  };

  addTemplate = (template: HTMLTemplateElement): this => {
    if (!this._child) {
      throw new Error('Child element not set. Call "setChildElement" first.');
    }

    this._child.parentElement?.appendChild(template);
    return this;
  };

  build = (): Component => {
    const component = {
      constructor: getCustomElementConstructor({
        lifecycles: this._lifecycles,
        attributes: this._attributes,
        template: this._child,
        mode: this._mode,
      }),
      mode: this._mode,
    };

    componentRegistry.set(this._name, component);
    customElements.define(this._name, component.constructor);

    return component;
  };
}
