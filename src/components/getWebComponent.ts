import {
  getLifecycleNameOrThrow,
  getShadowRootModeOrThrow,
  LifecycleName,
} from '../utils/webComponents';
import { getCustomElementConstructor } from './getCustomElementConstructor';

export function getWebComponent(element: Element, defaultMode: string): CustomElementConstructor {
  return getCustomElementConstructor({
    lifecycles: extractLifecycles(),
    attributes: getAttributes(),
    templateHtml: getTemplateHtml(),
    mode: getShadowRootMode(),
  });

  function extractLifecycles(): Map<LifecycleName, string> {
    const map = new Map<LifecycleName, string>();

    const scripts = element.querySelectorAll('script[type="lifecycle"]');
    for (const script of scripts) {
      const lifecycle = getLifecycleNameOrThrow(script.getAttribute('callback') || '');
      if (map.has(lifecycle)) {
        throw new Error(`Lifecycle "${lifecycle}" already defined`);
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

  function getTemplateHtml(): string {
    return element.innerHTML;
  }

  function getShadowRootMode(): ShadowRootMode {
    return getShadowRootModeOrThrow(
      (element.getAttribute('#mode') || defaultMode).toLocaleLowerCase(),
    );
  }
}
