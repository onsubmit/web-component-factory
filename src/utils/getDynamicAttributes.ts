export function getDynamicAttributes(
  element: HTMLElement,
  globalAttributes?: Record<string, string>,
): Record<string, string> {
  const attributes = { ...globalAttributes };

  for (const attribute of element.attributes) {
    attributes[attribute.name] = attribute.value;
  }

  for (const key1 of Object.keys(attributes)) {
    for (const key2 of Object.keys(attributes)) {
      if (key1 === key2) {
        continue;
      }

      attributes[key1] = attributes[key1].replaceAll(`{${key2}}`, attributes[key2]);
    }
  }

  return attributes;
}
