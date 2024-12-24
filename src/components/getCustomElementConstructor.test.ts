import { fixture, html, nextFrame } from '@open-wc/testing-helpers';
import { screen } from 'shadow-dom-testing-library';

import { LifecycleName } from '../utils/webComponents';
import { getCustomElementConstructor } from './getCustomElementConstructor';

describe('getCustomElementConstructor', () => {
  it('should render a basic component', async () => {
    const attributes = { name: 'Andy', age: '42' };
    const lifecycles = new Map<LifecycleName, string>();
    const templateHtml = '<p>Hi my name is {name} and I am {age} years old.</p>';
    const mode = 'open';

    const ctor = getCustomElementConstructor({
      attributes,
      lifecycles,
      templateHtml,
      mode,
    });

    customElements.define('my-person', ctor);

    await fixture(html`<my-person></my-person>`);
    await nextFrame();
    await screen.findByShadowText('Hi my name is Andy and I am 42 years old.');
  });

  it('should override attributes', async () => {
    const attributes = { name: 'Andy', age: '42' };
    const lifecycles = new Map<LifecycleName, string>();
    const templateHtml = '<p>Hi my name is {name} and I am {age} years old.</p>';
    const mode = 'open';

    const ctor = getCustomElementConstructor({
      attributes,
      lifecycles,
      templateHtml,
      mode,
    });

    customElements.define('my-person', ctor);

    await fixture(html`<my-person name="George" age="38"></my-person>`);
    await nextFrame();
    await screen.findByShadowText('Hi my name is George and I am 38 years old.');
  });

  it('should hook into lifecycle callbacks', async () => {
    const spy = vi.spyOn(console, 'log');

    const attributes = { name: 'Andy', age: '42' };
    const lifecycles = new Map<LifecycleName, string>([
      [
        'connected',
        `
          function connectedCallback() {
            console.log('connectedCallback');
          }
        `,
      ],
      [
        'attributeChanged',
        `
          function attributeChangedCallback(name, oldValue, newValue) {
            console.log('attributeChangedCallback');
            console.log('name: ' + name);
            console.log('oldValue: ' + oldValue);
            console.log('newValue: ' + newValue);
          }
        `,
      ],
    ]);
    const templateHtml = '<p>Hi my name is {name} and I am {age} years old.</p>';
    const mode = 'open';

    const ctor = getCustomElementConstructor({
      attributes,
      lifecycles,
      templateHtml,
      mode,
    });

    customElements.define('my-person', ctor);

    await fixture(html`<my-person name="George"></my-person>`);
    await nextFrame();

    expect(spy).toHaveBeenCalledTimes(5);
    expect(spy).toHaveBeenNthCalledWith(1, 'attributeChangedCallback');
    expect(spy).toHaveBeenNthCalledWith(2, 'name: name');
    expect(spy).toHaveBeenNthCalledWith(3, 'oldValue: null');
    expect(spy).toHaveBeenNthCalledWith(4, 'newValue: George');
    expect(spy).toHaveBeenNthCalledWith(5, 'connectedCallback');
  });

  it('should use a closed shadow root mode', async () => {
    const attributes = { name: 'Andy', age: '42' };
    const lifecycles = new Map<LifecycleName, string>();
    const templateHtml = '<p>Hi my name is {name} and I am {age} years old.</p>';
    const mode = 'closed';

    const ctor = getCustomElementConstructor({
      attributes,
      lifecycles,
      templateHtml,
      mode,
    });

    customElements.define('my-person', ctor);

    await fixture(html`<my-person></my-person>`);
    await nextFrame();
    const element = screen.queryByShadowText('Hi my name is Andy and I am 42 years old.');
    expect(element).toBeNull();
  });
});
