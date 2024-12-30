export type Attribute = {
  value: string;
  observed: boolean;
};

export function getDynamicAttributes(
  element: Element,
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

  if (['WEB-COMPONENT-FACTORY', 'WEB-COMPONENT'].includes(element.tagName)) {
    overrideObserved(element, attributes);
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

function overrideObserved(element: Element, attributes: Record<string, Attribute>): void {
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
    attributes[attribute.name] = { value: attribute.value, observed: defaultObservedValue };
  }

  updateObserved(attributes, observedAttributes, true);
  updateObserved(attributes, nonObservedAttributes, false);
}

function updateObserved(
  attributes: Record<string, Attribute>,
  elements: Array<Element>,
  observed: boolean,
): void {
  for (const element of elements) {
    const name = element.getAttribute('name');
    if (!name) {
      throw new Error('<attribute> must have a "name" attribute.');
    }

    if (!attributes[name]) {
      console.warn(`Could not find attribute with name ${name}`);
    } else {
      attributes[name].observed = observed;
    }
  }
}
