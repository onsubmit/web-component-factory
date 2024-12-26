export class WebComponent extends HTMLElement {
  private _originalSetAttribute = this.setAttribute;

  constructor() {
    super();
    this.setAttribute = this._setAttribute;
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
  };
}
