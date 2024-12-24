const lifecycleNames = ['connected', 'disconnected', 'adopted', 'attributeChanged'] as const;
export type LifecycleName = (typeof lifecycleNames)[number];

export function isLifecycle(name: string): name is LifecycleName {
  return (lifecycleNames as unknown as Array<string>).includes(name);
}

function isShadowRootMode(mode: string): mode is ShadowRootMode {
  return mode === 'open' || mode === 'closed';
}

export function getShadowRootModeOrThrow(mode: string): ShadowRootMode {
  if (!isShadowRootMode(mode)) {
    throw new Error('"mode" attribute must be "open" or "closed"');
  }

  return mode;
}
