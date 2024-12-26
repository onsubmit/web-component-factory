import { Component } from './components/webComponentFactory';

const componentRegistry = new Map<string, Component>();

export { componentRegistry };
