export class WebComponent extends HTMLElement {
  private _originalSetAttribute = this.setAttribute;

  constructor() {
    super();
    this.setAttribute = this._setAttribute;
  }

  protected onSetAttribute(_qualifiedName: string, _value: string): void {
    // Not implemented
  }

  private _setAttribute = (qualifiedName: string, value: string): void => {
    try {
      this._originalSetAttribute(qualifiedName, value);
    } catch {
      const parser = document.createElement('div');
      parser.innerHTML = `<br ${qualifiedName} />`;
      const attr = parser.firstElementChild!.attributes.removeNamedItem(qualifiedName);
      attr.value = value;
      this.attributes.setNamedItem(attr);
    }

    this.onSetAttribute(qualifiedName, value);
  };
}
