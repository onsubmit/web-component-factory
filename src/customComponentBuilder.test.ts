import { CustomComponentBuilder } from './customComponentBuilder';

describe('CustomComponentBuilder', () => {
  it('should throw if attribute name is empty', () => {
    expect(() => new CustomComponentBuilder('my-component').setAttribute('', '')).toThrow(
      'A non-empty "name" is required',
    );
  });
});
