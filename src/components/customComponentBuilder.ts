import { componentRegistry } from '../componentRegistry';
import { LifecycleCallback, LifecycleCallbacks, LifecycleName } from '../utils/webComponents';
import { getCustomElementConstructor } from './getCustomElementConstructor';
import { Component } from './webComponentFactory';

export class CustomComponentBuilder {
  private _name: string;
  private _mode: ShadowRootMode;
  private _template: Element | undefined;
  private _attributes: Map<string, string>;
  private _lifecycles: Partial<LifecycleCallbacks>;

  constructor(name: string) {
    this._name = name;
    this._mode = 'closed';
    this._attributes = new Map();
    this._lifecycles = {};
  }

  setMode = (mode: ShadowRootMode): this => {
    this._mode = mode;
    return this;
  };

  setAttribute = (name: string, value: string): this => {
    this._attributes.set(name, value);
    return this;
  };

  setAttributes = (attributes: Record<string, string>): this => {
    for (const [name, value] of Object.entries(attributes)) {
      this.setAttribute(name, value);
    }

    return this;
  };

  setTemplateElement = (element: Element | undefined): this => {
    this._template = element;
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
    if (!this._template) {
      throw new Error('Base template element not set. Call "setTemplateElement" first.');
    }

    this._template.parentElement?.appendChild(template);
    return this;
  };

  build = (): Component => {
    const component = {
      constructor: getCustomElementConstructor({
        lifecycles: this._lifecycles,
        attributes: Object.fromEntries(this._attributes),
        template: this._template,
        mode: this._mode,
      }),
      mode: this._mode,
    };

    componentRegistry.set(this._name, component);
    customElements.define(this._name, component.constructor);

    return component;
  };
}
