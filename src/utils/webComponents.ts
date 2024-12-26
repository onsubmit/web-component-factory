const lifecycleNames = ['connected', 'disconnected', 'adopted', 'attributeChanged'] as const;
export type LifecycleName = (typeof lifecycleNames)[number];

export type LifecycleSignature<T extends LifecycleName> = T extends 'attributeChanged'
  ? (name: string, oldValue: string, newValue: string) => void
  : () => void;

export type LifecycleSignatures = {
  [TName in LifecycleName]: LifecycleSignature<TName>;
};

function isLifecycle(name: string): name is LifecycleName {
  return (lifecycleNames as unknown as Array<string>).includes(name);
}

function isShadowRootMode(mode: string): mode is ShadowRootMode {
  return mode === 'open' || mode === 'closed';
}

export function getLifecycleNameOrThrow(name: string): LifecycleName {
  if (!isLifecycle(name)) {
    throw new Error(
      `"${name}" is not a valid lifecycle. Must be one of [${lifecycleNames.map((n) => `"${n}"`).join(', ')}]`,
    );
  }

  return name;
}

export function getShadowRootModeOrThrow(mode: string): ShadowRootMode {
  if (!isShadowRootMode(mode)) {
    throw new Error(`"mode" attribute must be "open" or "closed". Actual: "${mode}");`);
  }

  return mode;
}
