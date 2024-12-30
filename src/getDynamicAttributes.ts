export type Attribute = {
  value: string;
  observed: boolean;
};

export function getDynamicAttributes(
  element: HTMLElement,
  globalAttributes?: Record<string, Attribute>,
): Record<string, Attribute> {
  const attributes = structuredClone(globalAttributes) ?? {};

  for (const attribute of element.attributes) {
    if (attributes[attribute.name]) {
      attributes[attribute.name].value = attribute.value;
    } else {
      attributes[attribute.name] = { value: attribute.value, observed: true };
    }
  }

  for (const key1 of Object.keys(attributes)) {
    for (const key2 of Object.keys(attributes)) {
      if (key1 === key2) {
        continue;
      }

      attributes[key1].value = attributes[key1].value.replaceAll(
        `{${key2}}`,
        attributes[key2].value,
      );
    }
  }

  return attributes;
}
