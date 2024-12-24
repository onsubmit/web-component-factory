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
});
