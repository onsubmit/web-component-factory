import { getLifecycleNameOrThrow, getShadowRootModeOrThrow } from './webComponents';

describe('webComponents', () => {
  describe('getLifecycleNameOrThrow', () => {
    it('should classify a valid lifecycle name', () => {
      expect(getLifecycleNameOrThrow('connected')).toBe('connected');
      expect(getLifecycleNameOrThrow('disconnected')).toBe('disconnected');
      expect(getLifecycleNameOrThrow('adopted')).toBe('adopted');
      expect(getLifecycleNameOrThrow('attributeChanged')).toBe('attributeChanged');
    });

    it('should classify an invalid lifecycle name', () => {
      expect(() => getLifecycleNameOrThrow('')).toThrow(
        '"" is not a valid lifecycle. Must be one of ["connected", "disconnected", "adopted", "attributeChanged"]',
      );
      expect(() => getLifecycleNameOrThrow('invalid')).toThrow(
        '"invalid" is not a valid lifecycle. Must be one of ["connected", "disconnected", "adopted", "attributeChanged"]',
      );
    });
  });

  describe('getShadowRootModeOrThrow', () => {
    it('should get a valid ShadowRootMode', () => {
      expect(getShadowRootModeOrThrow('open')).toBe('open');
      expect(getShadowRootModeOrThrow('closed')).toBe('closed');
    });

    it('should throw on an invalid ShadowRootMode', () => {
      expect(() => getShadowRootModeOrThrow('')).toThrow(
        '"mode" attribute must be "open" or "closed". Actual: ""',
      );
      expect(() => getShadowRootModeOrThrow('invalid')).toThrow(
        '"mode" attribute must be "open" or "closed". Actual: "invalid"',
      );
    });
  });
});
