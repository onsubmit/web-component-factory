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

    customElements.define('my-person-1', ctor);

    await fixture(html`<my-person-1></my-person-1>`);
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

    customElements.define('my-person-2', ctor);

    await fixture(html`<my-person-2 name="George" age="38"></my-person-2>`);
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

    customElements.define('my-person-3', ctor);

    const element = await fixture(html`<my-person-3 name="George"></my-person-3>`);
    await nextFrame();

    expect(spy).toHaveBeenCalledTimes(5);
    expect(spy).toHaveBeenNthCalledWith(1, 'attributeChangedCallback');
    expect(spy).toHaveBeenNthCalledWith(2, 'name: name');
    expect(spy).toHaveBeenNthCalledWith(3, 'oldValue: null');
    expect(spy).toHaveBeenNthCalledWith(4, 'newValue: George');
    expect(spy).toHaveBeenNthCalledWith(5, 'connectedCallback');

    element.setAttribute('name', 'Fred');
    expect(spy).toHaveBeenCalledTimes(9);
    expect(spy).toHaveBeenNthCalledWith(6, 'attributeChangedCallback');
    expect(spy).toHaveBeenNthCalledWith(7, 'name: name');
    expect(spy).toHaveBeenNthCalledWith(8, 'oldValue: George');
    expect(spy).toHaveBeenNthCalledWith(9, 'newValue: Fred');
  });

  it('should hook into the adopted lifecycle callback', async () => {
    const spy = vi.spyOn(console, 'log');

    const attributes = { name: 'Andy', age: '42' };
    const lifecycles = new Map<LifecycleName, string>([
      [
        'adopted',
        `
          function adoptedCallback() {
            console.log('adoptedCallback');
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

    customElements.define('my-person-4', ctor);

    const element = await fixture(html`<my-person-4 name="George"></my-person-4>`);
    await nextFrame();

    expect(spy).not.toHaveBeenCalled();
    const iframe = document.createElement('iframe');
    document.body.appendChild(iframe);
    iframe.contentDocument?.body.appendChild(iframe.contentDocument.adoptNode(element));

    expect(spy).toHaveBeenCalledTimes(1);
    expect(spy).toHaveBeenCalledWith('adoptedCallback');
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

    customElements.define('my-person-5', ctor);

    await fixture(html`<my-person-5></my-person-5>`);
    await nextFrame();
    const element = screen.queryByShadowText('Hi my name is Andy and I am 42 years old.');
    expect(element).toBeNull();
  });
});
