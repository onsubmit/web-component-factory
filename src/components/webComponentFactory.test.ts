import { fixture, html } from '@open-wc/testing-helpers';
import { screen } from 'shadow-dom-testing-library';

import invariant from '../invariant';

describe('WebComponentFactory', () => {
  it('should render a basic component', async () => {
    await fixture(html`
      <wc-factory #mode="open">
        <wc #name="my-paragraph-1" text="Hello world">
          <p>{text}</p>
        </wc>
      </wc-factory>
    `);

    await fixture(html`<my-paragraph-1></my-paragraph-1>`);
    await screen.findByShadowText('Hello world');
  });

  it('should override attributes', async () => {
    await fixture(html`
      <wc-factory #mode="open">
        <wc #name="my-paragraph-2" text="Hello world">
          <p>{text}</p>
        </wc>
      </wc-factory>
    `);

    await fixture(html`<my-paragraph-2 text="Foo bar baz and so on"></my-paragraph-2>`);
    await screen.findByShadowText('Foo bar baz and so on');
  });

  it('should hook into lifecycle callbacks', async () => {
    const spy = vi.spyOn(console, 'log');

    await fixture(html`
      <wc-factory #mode="open">
        <wc #name="my-paragraph-3" text="Hello world">
          <p>{text}</p>
          <script type="lifecycle" callback="connected">
            function connectedCallback() {
              debugger;
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
        </wc>
      </wc-factory>
    `);

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
    // wc-factory defaults to "closed"
    await fixture(html`
      <wc-factory>
        <wc #name="my-paragraph-4" text="Hello world">
          <p>{text}</p>
        </wc>
      </wc-factory>
    `);

    await fixture(html`<my-paragraph-4></my-paragraph-4>`);
    const p = screen.queryByShadowText('Hello world');
    expect(p).toBeNull();
  });

  it('ignores children other than <wc> tags', async () => {
    await fixture(html`
      <wc-factory #mode="open">
        <wc #name="my-paragraph-5" text="Hello world">
          <p>{text}</p>
        </wc>
        <b>I'm ignored</b>
      </wc-factory>
    `);

    await fixture(html`<my-paragraph-5></my-paragraph-5>`);
    await screen.findByShadowText('Hello world');

    const b = screen.queryByText("I'm ignored");
    expect(b).toBeNull();
  });

  it('should throw when #name attribute is missing', async () => {
    type ErrorEventHandler = (this: Window, ev: ErrorEvent) => any;
    let errorEvent: ErrorEvent | undefined;

    const errorEventHandler: ErrorEventHandler = (event) => {
      event.preventDefault();
      errorEvent = event;
    };

    const obj = { errorEventHandler };
    const spy = vi.spyOn(obj, 'errorEventHandler');
    window.addEventListener('error', obj.errorEventHandler);

    await fixture(html`
      <wc-factory #mode="closed">
        <wc text="Hello world">
          <p>{text}</p>
        </wc>
      </wc-factory>
    `);

    expect(spy).toHaveBeenCalled();
    invariant(errorEvent);
    expect(errorEvent.message).toBe('"#name" attribute is required');

    window.removeEventListener('error', obj.errorEventHandler);
  });
});
