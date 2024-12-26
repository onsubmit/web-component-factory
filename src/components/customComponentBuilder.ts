import { registerComponent } from '../childComponentRegistry';
import { LifecycleName, LifecycleSignature, LifecycleSignatures } from '../utils/webComponents';
import { getCustomElementConstructor } from './getCustomElementConstructor';
import { ChildComponent } from './webComponentFactory';

export class CustomComponentBuilder {
  private _name: string;
  private _mode: ShadowRootMode;
  private _templateHtml: string;
  private _attributes: Map<string, string>;
  private _lifecycles: Partial<LifecycleSignatures>;

  constructor(name: string) {
    this._name = name;
    this._mode = 'closed';
    this._templateHtml = '';
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
      this._attributes.set(name, value);
    }

    return this;
  };

  setTemplate: {
    (input: HTMLElement): void;
    (input: string): void;
  } = (input: HTMLElement | string): this => {
    this._templateHtml = input instanceof HTMLElement ? input.outerHTML : input;
    return this;
  };

  setLifecycleCallback = <T extends LifecycleName>(
    name: T,
    callback: LifecycleSignature<T>,
  ): this => {
    this._lifecycles[name] = callback as LifecycleSignatures[T];
    return this;
  };

  build = (): ChildComponent => {
    const component = {
      constructor: getCustomElementConstructor({
        lifecycles: this._lifecycles,
        attributes: Object.fromEntries(this._attributes),
        templateHtml: this._templateHtml,
        mode: this._mode,
      }),
      mode: this._mode,
    };

    registerComponent(this._name, component);
    return component;
  };
}
