export type Attribute = {
  value: string;
  observed: boolean;
};

export function getDynamicAttributes(
  element: Element,
  globalAttributes?: Map<string, Attribute>,
): Map<string, Attribute> {
  const attributes = structuredClone(globalAttributes) ?? new Map<string, Attribute>();

  for (const attribute of element.attributes) {
    if (attributes.has(attribute.name)) {
      attributes.get(attribute.name)!.value = attribute.value;
    } else {
      attributes.set(attribute.name, { value: attribute.value, observed: true });
    }
  }

  if (['WEB-COMPONENT-FACTORY', 'WEB-COMPONENT'].includes(element.tagName)) {
    overrideObserved(element, attributes);
  }

  for (const key1 of attributes.keys()) {
    for (const key2 of attributes.keys()) {
      if (key1 === key2) {
        continue;
      }

      attributes.get(key1)!.value = attributes
        .get(key1)!
        .value.replaceAll(`{${key2}}`, attributes.get(key2)!.value);
    }
  }

  return attributes;
}

function overrideObserved(element: Element, attributes: Map<string, Attribute>): void {
  const childAttributes = [...element.children].filter((n) => n.tagName === 'ATTRIBUTE');
  const observedAttributes = childAttributes.filter(
    (n) => n.getAttribute('observed')?.toLowerCase() === 'true',
  );
  const nonObservedAttributes = childAttributes.filter(
    (n) => n.getAttribute('observed')?.toLowerCase() === 'false',
  );

  if (observedAttributes.length && nonObservedAttributes.length) {
    throw new Error(
      '<attribute> children must all have the same value for their observed attribute',
    );
  }

  const defaultObservedValue = !observedAttributes.length;
  for (const attribute of element.attributes) {
    attributes.set(attribute.name, { value: attribute.value, observed: defaultObservedValue });
  }

  updateObserved(attributes, observedAttributes, true);
  updateObserved(attributes, nonObservedAttributes, false);
}

function updateObserved(
  attributes: Map<string, Attribute>,
  elements: Array<Element>,
  observed: boolean,
): void {
  for (const element of elements) {
    const name = element.getAttribute('name');
    if (!name) {
      throw new Error('<attribute> must have a "name" attribute.');
    }

    if (!attributes.has(name)) {
      throw new Error(`Could not find attribute with name "${name}".`);
    } else {
      attributes.get(name)!.observed = observed;
    }
  }
}
