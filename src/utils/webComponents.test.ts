import { getShadowRootModeOrThrow, isLifecycle } from './webComponents';

describe('webComponents', () => {
  describe('isLifecycle', () => {
    it('should classify a valid lifecycle name', () => {
      expect(isLifecycle('connected')).toBe(true);
      expect(isLifecycle('disconnected')).toBe(true);
      expect(isLifecycle('adopted')).toBe(true);
      expect(isLifecycle('attributeChanged')).toBe(true);
    });

    it('should classify an invalid lifecycle name', () => {
      expect(isLifecycle('')).toBe(false);
      expect(isLifecycle('invalid')).toBe(false);
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
