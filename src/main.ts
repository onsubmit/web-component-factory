import './style.css';

import { WebComponent } from './components/webComponent';
import { WebComponentFactory } from './components/webComponentFactory';

customElements.define('wc-factory', WebComponentFactory);
customElements.define('web-component', WebComponent);
