import { base64 } from '../crypto/encode/base.js';
import { sha256 } from '../crypto/hash/sha256.js';
import type { Hash } from '../channel/interfaces/hash.js';
import type { Channel } from '../channel/channel.js';

export class Data {
  constructor(private readonly channels: Channel[]) {}

  /** @deprecated Implement in 'crypto' module. */
  private async hash(payload: string): Promise<Hash> {
    return {
      algorithm: 'sha256',
      value: base64.encode((await sha256(payload)).value),
    };
  }

  /** @deprecated Implement in 'node'/'channel' module. */
  async get(hash: Hash): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      void Promise.allSettled<Promise<void>>(
        this.channels.map(async (channel) => {
          const data = await channel.getNode(hash);
          if (!data || data.hash.algorithm !== hash.algorithm || data.hash.value !== hash.value) {
            return;
          }
          const validateHash = await this.hash(data.payload);
          if (
            data.hash.algorithm !== validateHash.algorithm ||
            data.hash.value !== validateHash.value
          ) {
            return;
          }
          resolve(data.payload);
        }),
      ).then((results) => {
        if (!results.find((promise) => promise.status === 'fulfilled' && promise.value)) {
          reject(new Error(`LibreBase: data not found: '${hash.algorithm}:${hash.value}'`));
        }
      });
    });
  }

  /** @deprecated Implement in 'node'/'channel' module. */
  async put(payload: string, mediaType = 'text/plain'): Promise<Hash> {
    const hash = await this.hash(payload);
    const results = await Promise.allSettled(
      this.channels.map(async (channel) => {
        await channel.putNode({
          hash,
          encoding: 'utf8',
          mediaType,
          payload,
        });
      }),
    );

    if (!results.find((promise) => promise.status === 'fulfilled')) {
      throw results;
    }

    return hash;
  }

  /** @deprecated Implement in 'node'/'channel' module. */
  getJSON<T>(hash: Hash): Promise<T> {
    return this.get(hash).then((payload) => JSON.parse(payload) as T);
  }

  /** @deprecated Implement in 'node'/'channel' module. */
  async putJSON<T>(payload: T): Promise<Hash> {
    return this.put(JSON.stringify(payload), 'application/json');
  }

  /** @deprecated Implement in 'node'/'channel' module. */
  getNamed(name: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      void Promise.allSettled<Promise<void>>(
        this.channels.map(async (channel) => {
          const hash = await channel.getAddressedNodeHash(name);
          if (!hash) return;
          const data = await channel.getNode(hash);
          if (!data || data.hash.algorithm !== hash.algorithm || data.hash.value !== hash.value) {
            return;
          }
          const validateHash = await this.hash(data.payload);
          if (
            data.hash.algorithm !== validateHash.algorithm ||
            data.hash.value !== validateHash.value
          ) {
            return;
          }
          resolve(data.payload);
        }),
      ).then((results) => {
        if (!results.find((promise) => promise.status === 'fulfilled' && promise.value)) {
          reject(new Error(`LibreBase: named data not found: '${name}'`));
        }
      });
    });
  }

  /** @deprecated Implement in 'node'/'channel' module. */
  async putNamed(payload: string, name: string, mediaType = 'text/plain'): Promise<Hash> {
    const hash = await this.hash(payload);
    const results = await Promise.allSettled(
      this.channels.map(async (channel) => {
        await channel.putNode({
          hash,
          encoding: 'utf8',
          mediaType,
          payload,
        });
        await channel.setAddressedNodeHash(name, hash);
      }),
    );

    if (!results.find((promise) => promise.status === 'fulfilled')) {
      throw results;
    }

    return hash;
  }

  /** @deprecated Implement in 'node'/'channel' module. */
  getNamedJSON<T>(name: string): Promise<T> {
    return this.getNamed(name).then((payload) => JSON.parse(payload) as T);
  }

  /** @deprecated Implement in 'node'/'channel' module. */
  putNamedJSON(payload: unknown, name: string): Promise<Hash> {
    return this.putNamed(JSON.stringify(payload), name, 'application/json');
  }
}
