import { DynamicAttributes } from './dynamicAttributes';

describe('DynamicAttributes', () => {
  it('should get an attribute value', () => {
    const attributes = new DynamicAttributes();
    attributes.set('foo', 'bar');
    expect(attributes.get('foo')).toBe('bar');
  });

  it('should throw if attribute is not found', () => {
    const attributes = new DynamicAttributes();
    expect(() => attributes.get('foo')).toThrow('Could not find attribute with name: "foo".');
  });
});
