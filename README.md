# web-component-factory

`web-component-factory` provides an alternate approach to defining web components that favors the use of markup.

## Example

### Conventional approach:

```js
class MyCustomElement extends HTMLElement {
  static observedAttributes = ['size'];

  attributeChangedCallback(name, oldValue, newValue) {
    console.log(`Attribute ${name} has changed from ${oldValue} to ${newValue}.`);
  }
}

customElements.define('my-custom-element', MyCustomElement);
```

```html
<my-custom-element size="100"></my-custom-element>
```

### With `web-component-factory`:

```html
<web-component-factory>
  <web-component #name="my-custom-element" size="100">
    <script type="lifecycle" callback="attributeChanged">
      function attributeChangedCallback(name, oldValue, newValue) {
        console.log(`Attribute ${name} has changed from ${oldValue} to ${newValue}.`);
      }
    </script>
  </web-component>
</web-component-factory>

<my-custom-element size="100"></my-custom-element>
```

## `<web-component-factory>`

`<web-component-factory>` is a custom element that when added to the document will define a new custom element for each `<web-component>` direct child it finds.

### Attributes

| Name    | Values           | Default value | Description                                                  |
| ------- | ---------------- | ------------- | ------------------------------------------------------------ |
| `#mode` | `closed \| open` | `closed`      | The default `ShadowRoot` mode for all child custom elements. |
|         |                  |               |                                                              |

Any other provided attributes are made available to any child custom elements as expression placeholders e.g. `{area}` becomes `400` in the example below.

```html
<web-component-factory area="400">
  <web-component #name="my-custom-element">
    <p>Area: {area}</p>
    <p>Size: {size}</p>
  </web-component>
</web-component-factory>

<my-custom-element size="100"></my-custom-element>

<!-- The shadow root will be: -->
<web-component>
  <p>Area: 400</p>
  <p>Size: 100</p>
</web-component>
```

## Child elements to `web-component-factory`

### `<web-component>` child element

`<web-component>` is a custom element that when added as a child to `<web-component-factory>` will define a new custom element.

#### Attributes

| Name        | Values                                                                                                                                  | Default value | Description                                                                                                         |
| ----------- | --------------------------------------------------------------------------------------------------------------------------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------- |
| `#name`     | [A valid custom element name](https://developer.mozilla.org/en-US/docs/Web/API/CustomElementRegistry/define#valid_custom_element_names) | -             | The name for the new custom element.                                                                                |
| `#mode`     | `closed \| open`                                                                                                                        | `closed`      | The `ShadowRoot` mode for the new custom element. Overrides the value specified on `<web-component-factory #mode>`. |
| `#template` | A valid CSS selector that matches a `<template>` element                                                                                | -             | The CSS selector for the `<template>` element to populate the shadow DOM of the web component.                      |
|             |                                                                                                                                         |               |                                                                                                                     |

Any other provided attributes:

1. Are automatically observed for changes to their values. Value changes will trigger the `attributeChangedCallback` if provided.
1. Are made available as expression placeholders.
1. Can override any attribute of the same name specified on the parent `<web-component-factory>`.

For example, the `area` attribute on the `<web-component>` overrides the attribute on `<web-component-factory>`, so its value will be `560`, not `400`.

```html
<web-component-factory area="400">
  <web-component #name="my-custom-element" area="560">
    <p>Area: {area}</p>
    <p>Size: {size}</p>
  </web-component>
</web-component-factory>

<my-custom-element size="100"></my-custom-element>

<!-- The shadow root will be: -->
<web-component>
  <p>Area: 560</p>
  <p>Size: 100</p>
</web-component>
```

### `<template>` child element

`<template>` elements work almost exactly the same as they do conventionally, with a few minor differences.

A `<web-component>` will use a `<template>` to populate its shadow DOM by providing its selector as the value of its `#template` attribute e.g. `<web-component #name="my-component" #template="#my-template">`.

A `<template>` can be defined at multiple levels in the DOM tree. When a template selector could match multiple elements, the matching precedence order is when the `<template>` exists:

1. As a direct child of a `<web-component>`.
1. As a direct child of the `<web-component-factory>`.
1. Anywhere else at the `document` level i.e. an element found by `document.querySelector(selector)`.

For example:

```html
<!-- document level template -->
<template id="firefox-template">
  <p>The web browser</p>
</template>

<web-component-factory>
  <!-- web-component-factory level template -->
  <template id="fox-template">
    <p>The quick brown fox</p>
  </template>

  <web-component #name="fire-fox" #template="#firefox-template"></web-component>
  <web-component #name="fast-fox" #template="#fox-template"></web-component>
  <web-component #name="slow-fox" #template="#fox-template">
    <!-- web-component level template -->
    <template id="fox-template">
      <p>The slow brown fox</p>
    </template>
  </web-component>
</web-component-factory>

<fire-fox></fire-fox>
<fast-fox></fast-fox>
<slow-fox></slow-fox>

<!-- The shadow root will be: -->
<fire-fox>
  <p>The web browser</p>
</fire-fox>

<fast-fox>
  <p>The quick brown fox</p>
</fast-fox>

<slow-fox>
  <p>The slow brown fox</p>
</slow-fox>
```

## Lifecycle callbacks

[Custom element lifecycle callbacks](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#custom_element_lifecycle_callbacks) can be specified directly in the markup. The `function` names must match exactly as in the below example.

```html
<web-component-factory>
  <web-component #name="welcome-text" name="NAME MISSING">
    <p>Welcome {name}!</p>

    <script type="lifecycle" callback="connected">
      function connectedCallback() {
        console.log('connectedCallback');
      }
    </script>

    <script type="lifecycle" callback="disconnected">
      function disconnectedCallback() {
        console.log('disconnectedCallback');
      }
    </script>

    <script type="lifecycle" callback="adopted">
      function adoptedCallback() {
        console.log('adoptedCallback');
      }
    </script>

    <script type="lifecycle" callback="attributeChanged">
      function attributeChangedCallback(name, oldValue, newValue) {
        console.log('attributeChangedCallback');
        console.log(`name: ${oldValue} -> ${newValue}`);
      }
    </script>
  </web-component>
</web-component-factory>

<welcome-text
  name="Andy"
  onmousedown="this.setAttribute('name', 'Joe');"
  onmouseup="this.parentElement.removeChild(this);"
></welcome-text>
```

Initial render:

```html
<welcome-text>
  <p>Welcome Andy!</p>
</welcome-text>

<!-- console logs:
  attributeChangedCallback
  name: null -> Andy
  connectedCallback
-->
```

on mousedown:

```html
<welcome-text>
  <p>Welcome Joe!</p>
</welcome-text>

<!-- console logs:
  attributeChangedCallback
  name: Andy -> Joe
-->
```

on mouseup:

```html
<!--
  <welcome-text> element removed from DOM
-->

<!-- console logs:
  disconnectedCallback
-->
```

## API

If markup isn't your jam, you can also write some JavaScript to tell `<web-component-factory>` to define your web components too.

The below example will:

1. Define a custom element named `<welcome-message>`.
1. It will have an open shadow DOM.
1. It has a single observed attribute named `text` that has a default value of "Default message".
1. It has a connected lifecycle callback that logs a 👋 emoji.
1. Its shadow root consists of a `<span>` element with text the value of the `text` attribute.
1. The instance of the element provides "Welcome, friend!" for the value of the `text` attribute.

```js
const span = document.createElement('span');
span.textContent = '{text}';

new WebComponentFactory()
  .getComponentBuilder('welcome-message')
  .setMode('open')
  .setAttribute('text', 'Default message')
  .setLifecycleCallback('connected', () => console.log('👋'))
  .setChildElement(span)
  .build();
```

```html
<welcome-message text="Welcome, friend!"></welcome-message>
```

```html
<!-- The shadow root will be: -->
<welcome-message>
  <span>Welcome, friend!</span>
</welcome-message>

<!-- console logs:
  👋
-->
```
