import './style.css';

import { WebComponentFactory } from './components/webComponentFactory';

customElements.define('wc-factory', WebComponentFactory);

new WebComponentFactory()
  .getComponentBuilder('welcome-message')
  .setMode('open')
  .setAttribute('text', 'Default message')
  .setLifecycleCallback('connected', () => console.log('👋'))
  .setTemplate('<span>{text}</span>')
  .build();
