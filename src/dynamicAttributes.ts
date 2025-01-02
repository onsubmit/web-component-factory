export type Attribute = {
  value: string;
  observed: boolean;
};

export type DynamicAttributesInput = Partial<{
  element: Element;
  initial?: DynamicAttributes;
}>;

export class DynamicAttributes {
  private _attributes: Map<string, Attribute>;

  constructor(input?: DynamicAttributesInput) {
    this._attributes = this._getDynamicAttributes(input ?? {});
  }

  get attributes(): Map<string, Attribute> {
    return this._attributes;
  }

  get observedAttributes(): Array<string> {
    return [...this._attributes.keys()].filter(
      (key) => this._attributes.get(key)?.observed ?? false,
    );
  }

  entries = (): MapIterator<[string, Attribute]> => this._attributes.entries();

  get = (name: string): string => {
    return this._get(name).value;
  };

  set = (name: string, value: string): this => {
    const attribute = this._attributes.get(name);

    if (!attribute) {
      this._attributes.set(name, { value, observed: true });
    } else {
      attribute.value = value;
    }

    return this;
  };

  observe = (name: string): this => {
    this._get(name).observed = true;
    return this;
  };

  ignore = (name: string): this => {
    this._get(name).observed = false;
    return this;
  };

  private _get = (name: string): Attribute => {
    const attribute = this._attributes.get(name);
    if (!attribute) {
      throw new Error(`Could not find attribute with name: "${name}".`);
    }

    return attribute;
  };

  private _getDynamicAttributes = (input: DynamicAttributesInput): Map<string, Attribute> => {
    const { element, initial } = input;

    const attributes = structuredClone(initial?.attributes) ?? new Map<string, Attribute>();

    if (!element) {
      return attributes;
    }

    for (const attribute of element.attributes) {
      if (attributes.has(attribute.name)) {
        attributes.get(attribute.name)!.value = attribute.value;
      } else {
        attributes.set(attribute.name, { value: attribute.value, observed: true });
      }
    }

    if (['WEB-COMPONENT-FACTORY', 'WEB-COMPONENT'].includes(element.tagName)) {
      this._overrideObserved(element, attributes);
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
  };

  private _overrideObserved = (element: Element, attributes: Map<string, Attribute>): void => {
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

    this._updateObserved(attributes, observedAttributes, true);
    this._updateObserved(attributes, nonObservedAttributes, false);
  };

  private _updateObserved = (
    attributes: Map<string, Attribute>,
    elements: Array<Element>,
    observed: boolean,
  ): void => {
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
  };
}
