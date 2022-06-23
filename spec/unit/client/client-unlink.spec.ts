import { mocked } from 'jest-mock';

import RedisShim from '../../../lib/shims/redis-shim';
import Client from '../../../lib/client';

jest.mock('../../../lib/shims/redis-shim');


beforeEach(() => mocked(RedisShim).mockReset());

describe("Client", () => {

  let client: Client;

  beforeEach(async () => client = new Client());

  describe("#unlink", () => {
    describe("when called on an open client", () => {
      beforeEach(async () => {
        await client.open();
      });

      it("doesn't invoke the shim when passed no keys", async () => {
        await client.unlink();
        expect(RedisShim.prototype.unlink).not.toHaveBeenCalled();
      });

      it("passes a single key to the shim", async () => {
        await client.unlink('foo');
        expect(RedisShim.prototype.unlink).toHaveBeenCalledWith(expect.arrayContaining(['foo']));
      });

      it("passes multiple keys to the shim", async () => {
        await client.unlink('foo', 'bar', 'baz');
        expect(RedisShim.prototype.unlink).toHaveBeenCalledWith(expect.arrayContaining(['foo', 'bar', 'baz']));
      });
    });

    describe("when called on a closed client", () => {
      beforeEach(async () => {
        await client.open();
        await client.close();
      });

      it("errors when called on a closed client", () =>
        expect(async () => await client.unlink('foo'))
          .rejects.toThrow("Redis connection needs to be open."));
    });

    it("errors when called on a new client", async () =>
      expect(async () => await client.unlink('foo'))
        .rejects.toThrow("Redis connection needs to be open."));
  });
});
