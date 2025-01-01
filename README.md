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

Any other provided attributes:

1. Are automatically observed for changes to their values. Value changes will trigger the `attributeChangedCallback` if provided. This behavior can be overriden. See
   [Attribute Observability](#attribute-observability).
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

A `<web-component>` will use a `<template>` to populate its shadow DOM by providing its selector as the value of its `#template` attribute e.g.
`<web-component #name="my-component" #template="#my-template">`.

A `<template>` can be defined at multiple levels in the DOM tree. When a template selector could match multiple elements, the matching precedence order is as follows. When the `<template>` exists:

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

[Custom element lifecycle callbacks](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements#custom_element_lifecycle_callbacks) can be specified directly in the markup.
The `function` names must match exactly as in the below example.

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

## Attribute Observability

By default, all attributes are observed for changes. In the below example, any change to `name` and `age` will each trigger the `attributeChanged` lifecycle callback.

```html
<web-component-factory age="AGE MISSING">
  <web-component #name="welcome-text" name="NAME MISSING">
    <p>Welcome {name}! I hear you are {age} years old.</p>

    <script type="lifecycle" callback="attributeChanged">
      function attributeChangedCallback(name, oldValue, newValue) {
        console.log(`name: ${oldValue} -> ${newValue}`);
      }
    </script>
  </web-component>
</web-component-factory>

<welcome-text
  name="Andy"
  age="40"
  onmousedown="this.setAttribute('name', 'Joe'); this.setAttribute('age', '50');"
>
</welcome-text>
```

Clicking on the text will update the shadow DOM and write to the console.

```html
<welcome-text>
  <p>Welcome Joe! I hear you are 50 years old.</p>
</welcome-text>

<!-- console logs:
  name: Andy -> Joe
  age: 40 -> 50
-->
```

The default observability of attributes can be overridden by providing `<attribute>` child elements to the `<web-component-factory>` and/or `<web-component>` elements.

The rules for this logic is as follows:

- Specific attributes can be _excluded_ from being observed using `<attribute observed="false">`. All other attributes will remain observed by default. In the example below `name` will not be
  observed, but `age` still will be.

```html
<web-component-factory>
  <web-component #name="welcome-text" name="NAME MISSING" age="AGE MISSING">
    <attribute name="name" observed="false"></attribute>
    <p>Welcome {name}! I hear you are {age} years old.</p>
  </web-component>
</web-component-factory>

<welcome-text
  name="Andy"
  age="40"
  onmousedown="this.setAttribute('name', 'Joe'); this.setAttribute('age', '50');"
>
</welcome-text>
```

- Specific attributes can be set to _only_ be observed using `<attribute observed="true">`. All other attributes will _no longer_ be observed by default. In the example below, only `name` will be
  observed. `age` will not.

```html
<web-component-factory>
  <web-component #name="welcome-text" name="NAME MISSING" age="AGE MISSING">
    <attribute name="name" observed="true"></attribute>
    <p>Welcome {name}! I hear you are {age} years old.</p>
  </web-component>
</web-component-factory>

<welcome-text
  name="Andy"
  age="40"
  onmousedown="this.setAttribute('name', 'Joe'); this.setAttribute('age', '50');"
>
</welcome-text>
```

- An error will be thrown if all `<attribute>` elements do not have the same value for their `observed` attributes. The below example is invalid.

```html
<web-component #name="welcome-text" name="NAME MISSING" age="AGE MISSING">
  <!-- THIS WILL THROW AN ERROR -->
  <attribute name="name" observed="true"></attribute>
  <attribute name="age" observed="false"></attribute>
  <!-- THIS WILL THROW AN ERROR -->
  <p>Welcome {name}! I hear you are {age} years old.</p>
</web-component>
```

- `<attribute>` elements that are children of `<web-component>` take precedence over those that are children of `<web-component-factory>`. In the example below, `age` is only observed in
  `<welcome-text>`, not `<goodbye-text>`. `name` is observed in both custom elements.

```html
<web-component-factory age="AGE MISSING" name="NAME MISSING">
  <attribute name="age" observed="false"></attribute>
  <web-component #name="welcome-text">
    <attribute name="age" observed="true"></attribute>
    <p>Welcome {name}! I hear you are {age} years old.</p>
  </web-component>

  <web-component #name="goodbye-text">
    <p>Goodbye {name}! Last I heard you were {age} years old.</p>
  </web-component>
</web-component-factory>

<welcome-text
  name="Andy"
  age="40"
  onmousedown="this.setAttribute('name', 'Joe'); this.setAttribute('age', '50');"
>
</welcome-text>

<goodbye-text
  name="Andy"
  age="40"
  onmousedown="this.setAttribute('name', 'Joe'); this.setAttribute('age', '50');"
>
</goodbye-text>
```

```html
<!-- After clicking each element... -->
<welcome-text>
  <p>Welcome Joe! I hear you are 50 years old.</p>
</welcome-text>

<goodbye-text>
  <p>Goodbye Joe! Last I heard you were 40 years old.</p>
</goodbye-text>
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

```ts
const span = document.createElement('span');
span.textContent = '{text}';

new WebComponentFactory()
  .getComponentBuilder('welcome-message')
  .setMode('open')
  .setAttribute('text', 'Hello World!')
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

## Advanced example

Let's take the example from [MDN's article on templates and slots](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_templates_and_slots#a_more_involved_example).

I've omitted the `<style>` tag in the `<template>` for brevity but you can see the end result is equivalent.

```html
<web-component-factory #mode="open">
  <web-component #name="element-details" #template="#element-details-template"></web-component>

  <template id="element-details-template">
    <details>
      <summary>
        <span>
          <code class="name">&lt;<slot name="element-name">NEED NAME</slot>&gt;</code>
          <span class="desc"><slot name="description">NEED DESCRIPTION</slot></span>
        </span>
      </summary>
      <div class="attributes">
        <h4><span>Attributes</span></h4>
        <slot name="attributes"><p>None</p></slot>
      </div>
    </details>
    <hr />
  </template>
</web-component-factory>

<element-details>
  <span slot="element-name">slot</span>
  <span slot="description"
    >A placeholder inside a web component that users can fill with their own markup, with the effect
    of composing different DOM trees together.</span
  >
  <dl slot="attributes">
    <dt>name</dt>
    <dd>The name of the slot.</dd>
  </dl>
</element-details>

<element-details>
  <span slot="element-name">template</span>
  <span slot="description"
    >A mechanism for holding client- side content that is not to be rendered when a page is loaded
    but may subsequently be instantiated during runtime using JavaScript.</span
  >
</element-details>
```
