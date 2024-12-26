import {
  getLifecycleNameOrThrow,
  getShadowRootModeOrThrow,
  LifecycleSignatures as LifecycleCallbacks,
} from '../utils/webComponents';
import { getCustomElementConstructor } from './getCustomElementConstructor';
import { ChildComponent } from './webComponentFactory';

export function getWebComponent(element: Element, defaultMode: string): ChildComponent {
  const mode = getShadowRootMode();
  return {
    constructor: getCustomElementConstructor({
      lifecycles: extractLifecycles(),
      attributes: getAttributes(),
      templateHtml: getTemplateHtml(),
      mode,
    }),
    mode,
  };

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
          const funcStrWithArgs = `${funcStr}\n;attributeChangedCallback?.('${name}', '${oldValue}', '${newValue}');`;
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

  function getAttributes(): Record<string, string> {
    return [...element.attributes].reduce<Record<string, string>>((acc, attribute) => {
      acc[attribute.name] = attribute.value;
      return acc;
    }, {});
  }

  function getTemplateHtml(): string {
    return element.innerHTML;
  }

  function getShadowRootMode(): ShadowRootMode {
    return getShadowRootModeOrThrow(
      (element.getAttribute('#mode') || defaultMode).toLocaleLowerCase(),
    );
  }
}
