import { fixture, html } from '@open-wc/testing-helpers';
import { screen } from 'shadow-dom-testing-library';

import invariant from '../test/invariant';
import { WebComponentFactory } from './webComponentFactory';

export type ErrorEventHandler = (this: Window, ev: ErrorEvent) => any;

describe('WebComponentFactory', () => {
  describe('markup', () => {
    it('should render a basic component', async () => {
      await fixture(html`
        <wc-factory #mode="open">
          <web-component #name="my-paragraph-1" text="Hello world">
            <p>{text}</p>
          </web-component>
        </wc-factory>
      `);

      await fixture(html`<my-paragraph-1></my-paragraph-1>`);
      await screen.findByShadowText('Hello world');
    });

    it('should override attributes', async () => {
      await fixture(html`
        <wc-factory #mode="open">
          <web-component #name="my-paragraph-2" text="Hello world">
            <p>{text}</p>
          </web-component>
        </wc-factory>
      `);

      await fixture(html`<my-paragraph-2 text="Foo bar baz and so on"></my-paragraph-2>`);
      await screen.findByShadowText('Foo bar baz and so on');
    });

    it('should hook into lifecycle callbacks', async () => {
      const spy = vi.spyOn(console, 'log');

      await fixture(html`
        <wc-factory #mode="open">
          <web-component #name="my-paragraph-3" text="Hello world">
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
          </web-component>
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
          <web-component #name="my-paragraph-4" text="Hello world">
            <p>{text}</p>
          </web-component>
        </wc-factory>
      `);

      await fixture(html`<my-paragraph-4></my-paragraph-4>`);
      const p = screen.queryByShadowText('Hello world');
      expect(p).toBeNull();
    });

    it('ignores children other than <web-component> tags', async () => {
      await fixture(html`
        <wc-factory #mode="open">
          <web-component #name="my-paragraph-5" text="Hello world">
            <p>{text}</p>
          </web-component>
          <b>I'm ignored</b>
        </wc-factory>
      `);

      await fixture(html`<my-paragraph-5></my-paragraph-5>`);
      await screen.findByShadowText('Hello world');

      const b = screen.queryByText("I'm ignored");
      expect(b).toBeNull();
    });

    it('should throw when #name attribute is missing', async () => {
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
          <web-component text="Hello world">
            <p>{text}</p>
          </web-component>
        </wc-factory>
      `);

      expect(spy).toHaveBeenCalled();
      invariant(errorEvent);
      expect(errorEvent.message).toBe('"#name" attribute is required');

      window.removeEventListener('error', obj.errorEventHandler);
    });

    it('should throw when duplicate child component definitions exist', async () => {
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
          <web-component #name="my-paragraph-6" text="Hello world">
            <p>{text}</p>
          </web-component>
          <web-component #name="my-paragraph-6" text="Good morning">
            <p>{text}</p>
          </web-component>
        </wc-factory>
      `);

      expect(spy).toHaveBeenCalled();
      invariant(errorEvent);
      expect(errorEvent.message).toBe('Duplicate definition found for "my-paragraph-6"');

      window.removeEventListener('error', obj.errorEventHandler);
    });

    it('should expose the child component constructors', async () => {
      await fixture(html`
        <wc-factory #mode="open">
          <web-component #name="my-paragraph-7" text="Hello world">
            <p>{text}</p>
          </web-component>
        </wc-factory>
      `);

      await fixture(html`<my-paragraph-7></my-paragraph-7>`);
      await screen.findByShadowText('Hello world');

      const factory = document.querySelector<WebComponentFactory>('wc-factory');
      invariant(factory);

      const component = factory.getComponent('my-paragraph-7');
      invariant(component);

      expect(component.mode).toBe('open');

      const paragraph = new component.constructor();
      paragraph.setAttribute('text', 'Merry Christmas!');
      document.body.appendChild(paragraph);

      await screen.findByShadowText('Merry Christmas!');
    });

    it('should reference templates', async () => {
      await fixture(html`
        <template id="nerf-herder-ipsum">
          <p>Jar jar binks blaster kylo ren</p>
        </template>
        <wc-factory #mode="open">
          <template id="lorem-ipsum">
            <p>Lorem ipsum dolor sit amet</p>
          </template>
          <web-component #name="default-generator" #template="#lorem-ipsum"></web-component>
          <web-component #name="custom-generator" #template="#lorem-ipsum">
            <template id="lorem-ipsum">
              <p>Faucibus vitae aliquet nec ullamcorper</p>
            </template>
          </web-component>
          <web-component
            #name="nerf-herder-generator"
            #template="#nerf-herder-ipsum"
          ></web-component>
        </wc-factory>
      `);

      await fixture(html`
        <default-generator></default-generator>
        <custom-generator></custom-generator>
        <nerf-herder-generator></nerf-herder-generator>
      `);

      await screen.findByShadowText('Lorem ipsum dolor sit amet');
      await screen.findByShadowText('Faucibus vitae aliquet nec ullamcorper');
      await screen.findByShadowText('Jar jar binks blaster kylo ren');
    });

    it('should throw if referenced template is not found', async () => {
      let errorEvent: ErrorEvent | undefined;

      const errorEventHandler: ErrorEventHandler = (event) => {
        event.preventDefault();
        errorEvent = event;
      };

      const obj = { errorEventHandler };
      const spy = vi.spyOn(obj, 'errorEventHandler');
      window.addEventListener('error', obj.errorEventHandler);

      await fixture(html`
        <wc-factory #mode="open">
          <web-component #name="missing-template" #template="#invalid"></web-component>
        </wc-factory>
      `);

      expect(spy).toHaveBeenCalled();
      invariant(errorEvent);
      expect(errorEvent.message).toBe('Could not find template with selector "#invalid".');

      window.removeEventListener('error', obj.errorEventHandler);
    });
  });

  describe('programmatic', () => {
    it('should render a basic component', async () => {
      const template = document.createElement('span');
      template.textContent = '{text}';

      new WebComponentFactory()
        .getComponentBuilder('my-span-2')
        .setMode('open')
        .setAttributes({ text: 'Hello World!' })
        .setLifecycleCallback('connected', () => console.log('connectedCallback'))
        .setTemplateElement(template)
        .build();

      await fixture(html`<my-span-2></my-span-2>`);
      await screen.findByShadowText('Hello World!');
    });

    it('should throw if an empty name is provided', () => {
      expect(() => new WebComponentFactory().getComponentBuilder('')).toThrow(
        'A non-empty "name" is required',
      );
    });

    it('should throw if a duplicate component is found', () => {
      const factory = new WebComponentFactory();
      factory.getComponentBuilder('my-span-3').build();
      expect(() => factory.getComponentBuilder('my-span-3')).toThrow(
        'Component "my-span-3" already exists',
      );
    });

    it('should reference templates', async () => {
      const factory = new WebComponentFactory();
      factory.mode = 'open';

      const factoryTemplate = document.createElement('template');
      factoryTemplate.id = 'template';
      factoryTemplate.innerHTML = '<p>I am a factory template</p>';
      factory.addTemplate(factoryTemplate);

      const componentTemplate = document.createElement('template');
      componentTemplate.id = 'template';
      componentTemplate.innerHTML = '<p>I am a component template</p>';

      const wc1 = document.createElement('web-component');
      wc1.setAttribute('#name', 'my-component-1');
      wc1.setAttribute('#template', '#template');
      wc1.appendChild(componentTemplate);

      const wc2 = document.createElement('web-component');
      wc2.setAttribute('#name', 'my-component-2');
      wc2.setAttribute('#template', '#template');

      factory.addComponent(wc1);
      factory.addComponent(wc2);

      await fixture(html`
        <my-component-1></my-component-1>
        <my-component-2></my-component-2>
      `);

      await screen.findByShadowText('I am a component template');
      await screen.findByShadowText('I am a factory template');
    });
  });
});
