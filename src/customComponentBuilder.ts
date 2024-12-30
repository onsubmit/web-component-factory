import { componentRegistry } from './componentRegistry';
import { Component } from './components/webComponentFactory';
import { getCustomElementConstructor } from './getCustomElementConstructor';
import { Attribute } from './getDynamicAttributes';
import { LifecycleCallback, LifecycleCallbacks, LifecycleName } from './webComponents';

export class CustomComponentBuilder {
  private _name: string;
  private _mode: ShadowRootMode;
  private _child: Element | undefined;
  private _attributes: Map<string, Attribute>;
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

  setAttribute = (name: string, attribute: Attribute): this => {
    this._attributes.set(name, attribute);
    return this;
  };

  setAttributes = (attributes: Record<string, Attribute>): this => {
    for (const [name, attribute] of Object.entries(attributes)) {
      this.setAttribute(name, attribute);
    }

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
        attributes: Object.fromEntries(this._attributes),
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
