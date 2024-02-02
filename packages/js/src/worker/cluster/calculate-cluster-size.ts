export const CLUSTER_SIZE_DEFAULT_CEILING = 1;
export const CLUSTER_SIZE_DEFAULT_FLOOR = 1;
export const CLUSTER_SIZE_DEFAULT_MULTIPLIER = 0.25;

/**
 * Calculate optimal cluster size, scaling with the `navigator.hardwareConcurrency` value when
 * available.
 */
export function calculateClusterSize(
  ceiling = CLUSTER_SIZE_DEFAULT_CEILING,
  floor = CLUSTER_SIZE_DEFAULT_FLOOR,
  multiplier = CLUSTER_SIZE_DEFAULT_MULTIPLIER,
) {
  return Math.min(
    Math.max(Math.floor(navigator.hardwareConcurrency ?? 1 * multiplier), floor),
    ceiling,
  );
}
