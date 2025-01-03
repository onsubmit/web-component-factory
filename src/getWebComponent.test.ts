import { fixture, html } from '@open-wc/testing-helpers';
import { screen } from 'shadow-dom-testing-library';

import { getWebComponent } from './getWebComponent';

describe('getWebComponent', () => {
  it('should render a basic component', async () => {
    const element = await fixture(html`
      <web-component #name="my-paragraph-1" text="Hello world">
        <p>{text}</p>
      </web-component>
    `);

    getWebComponent({ element, defaultMode: 'open' });

    await fixture(html`<my-paragraph-1></my-paragraph-1>`);
    await screen.findByShadowText('Hello world');
  });

  it('should override attributes', async () => {
    const element = await fixture(html`
      <web-component #name="my-paragraph-2" text="Hello world">
        <p>{text}</p>
      </web-component>
    `);

    getWebComponent({ element, defaultMode: 'open' });

    await fixture(html`<my-paragraph-2 text="Foo bar baz and so on"></my-paragraph-2>`);
    await screen.findByShadowText('Foo bar baz and so on');
  });

  it('should hook into lifecycle callbacks', async () => {
    const spy = vi.spyOn(console, 'log');

    const element = await fixture(html`
      <web-component #name="my-paragraph-3" text="Hello world">
        <p>{text}</p>
        <script type="lifecycle" callback="connected">
          function connectedCallback() {
            console.log('connectedCallback');
          }
        </script>
        <script type="lifecycle" callback="attributeChanged">
          function attributeChangedCallback(name, oldValue, newValue) {
            console.log('attributeChangedCallback');
            console.log('name: ' + name);
            console.log('oldValue: ' + oldValue);
            console.log('newValue: ' + newValue);
          }
        </script>
      </web-component>
    `);

    getWebComponent({ element, defaultMode: 'open' });

    await fixture(html`<my-paragraph-3 text="How are you?"></my-paragraph-3>`);
    await screen.findByShadowText('How are you?');

    expect(spy).toHaveBeenCalledTimes(5);
    expect(spy).toHaveBeenNthCalledWith(1, 'attributeChangedCallback');
    expect(spy).toHaveBeenNthCalledWith(2, 'name: text');
    expect(spy).toHaveBeenNthCalledWith(3, 'oldValue: null');
    expect(spy).toHaveBeenNthCalledWith(4, 'newValue: How are you?');
    expect(spy).toHaveBeenNthCalledWith(5, 'connectedCallback');
  });

  it('should use a closed shadow root mode', async () => {
    const element = await fixture(html`
      <web-component #name="my-paragraph-4" text="Hello world">
        <p>{text}</p>
      </web-component>
    `);

    getWebComponent({ element, defaultMode: 'closed' });

    await fixture(html`<my-paragraph-4></my-paragraph-4>`);
    const p = screen.queryByShadowText('Hello world');
    expect(p).toBeNull();
  });

  it('should throw when an duplicate lifecycle is found', async () => {
    const element = await fixture(html`
      <web-component #name="my-paragraph-5" text="Hello world">
        <p>{text}</p>
        <script type="lifecycle" callback="connected">
          function connectedCallback() {
            console.log('connectedCallback');
          }
        </script>
        <script type="lifecycle" callback="connected">
          function connectedCallback() {
            console.log('connectedCallback');
          }
        </script>
      </web-component>
    `);

    expect(() => getWebComponent({ element, defaultMode: 'open' })).toThrow(
      'Lifecycle "connected" already defined',
    );
  });
});
