import { componentRegistry } from './componentRegistry';
import { Component } from './components/webComponentFactory';
import { CustomComponentBuilder } from './customComponentBuilder';
import { DynamicAttributes } from './dynamicAttributes';
import {
  getLifecycleNameOrThrow,
  getShadowRootModeOrThrow,
  LifecycleCallbacks,
} from './webComponents';

export function getWebComponent(input: {
  element: Element;
  defaultMode: string;
  initial?: DynamicAttributes;
}): Component {
  const { element, defaultMode, initial } = input;

  const name = element.getAttribute('#name');
  if (!name) {
    throw new Error('"#name" attribute is required');
  }

  if (componentRegistry.has(name)) {
    throw new Error(`Duplicate definition found for "${name}"`);
  }

  return new CustomComponentBuilder(name)
    .setMode(getShadowRootMode())
    .setLifecycleCallbacks(extractLifecycles())
    .setAttributes(new DynamicAttributes({ element, initial }))
    .setChildElement(getChild())
    .build();

  function extractLifecycles(): Partial<LifecycleCallbacks> {
    const callbacks: Partial<LifecycleCallbacks> = {};

    const scripts = element.querySelectorAll('script[type="lifecycle"]');
    for (const script of scripts) {
      const lifecycle = getLifecycleNameOrThrow(script.getAttribute('callback') || '');
      if (callbacks[lifecycle]) {
        throw new Error(`Lifecycle "${lifecycle}" already defined`);
      }

      let funcStr = script.textContent || '';

      if (lifecycle === 'attributeChanged') {
        callbacks.attributeChanged = (name: string, oldValue: string, newValue: string): void => {
          const funcStrWithArgs = `${funcStr}\n;attributeChangedCallback?.(${[name, oldValue, newValue].map((v) => JSON.stringify(v)).join(', ')});`;
          eval(funcStrWithArgs);
        };
      } else {
        funcStr += `\n;${lifecycle}Callback?.();`;
        callbacks[lifecycle] = (): void => eval(funcStr);
      }

      element.removeChild(script);
    }

    return callbacks;
  }

  function getChild(): Element | undefined {
    const selector = element.getAttribute('#template');
    if (!selector) {
      const template = document.createElement('template');
      template.innerHTML = element.innerHTML;
      return template;
    }

    const template =
      element.querySelector(selector) ??
      element.parentElement?.querySelector(selector) ??
      document.querySelector(selector);

    if (!template) {
      throw new Error(`Could not find template with selector "${selector}".`);
    }

    return template;
  }

  function getShadowRootMode(): ShadowRootMode {
    return getShadowRootModeOrThrow(
      (element.getAttribute('#mode') || defaultMode).toLocaleLowerCase(),
    );
  }
}
