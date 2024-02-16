import type { LoadBalancer } from './type';

export const roundRobin: LoadBalancer = (items) => {
  let currentIndex = 0;
  return () => items[++currentIndex == items.length ? (currentIndex = 0) : currentIndex];
};
