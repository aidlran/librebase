/**
 * The type signature for a load balancer constructor.
 *
 * @category Load Balancer
 * @template T The item type.
 * @param items An array of items to load balance.
 * @returns A function that gets the next item.
 */
export type LoadBalancer = <T>(items: T[]) => () => T;

/**
 * Creates a basic round robin load balancer. Items are hit sequentially, looping back to the
 * beginning upon reaching the final item.
 *
 * @category Load Balancer
 * @template T The item type.
 * @param items An array of items to load balance.
 * @returns A function that gets the next item.
 */
export const roundRobin: LoadBalancer = (items) => {
  let currentIndex = 0;
  return () => items[++currentIndex == items.length ? (currentIndex = 0) : currentIndex];
};
