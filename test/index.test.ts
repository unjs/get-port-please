import { Server } from "node:net";
import { describe, test, expect, afterEach } from "vitest";
import { getPort } from "../src";
import { blockPort } from "./utils";

describe("getPort ()", () => {
  describe("checks ports on default host`", () => {
    let portBlocker: Server;

    afterEach(() => {
      portBlocker?.close();
    });

    test("default port is NOT IN USE", async () => {
      const port = await getPort();
      expect(port).toEqual(3000);
    });

    test("default port is in use", async () => {
      portBlocker = await blockPort(3000);
      const port = await getPort();
      expect(port).toEqual(3001);
    });
  });
});

describe("getPort (host)", () => {
  describe("checks ports on `localhost`", () => {
    let portBlocker: Server;

    afterEach(() => {
      portBlocker?.close();
    });

    test("default port is NOT IN USE", async () => {
      const port = await getPort({ host: "localhost" });
      expect(port).toEqual(3000);
    });

    test("default port is IN USE", async () => {
      portBlocker = await blockPort(3000, "localhost");
      const port = await getPort({ host: "localhost" });
      expect(port).toEqual(3001);
    });
  });
});

describe("getPort (host)", () => {
  let portBlocker: Server;

  afterEach(() => {
    portBlocker?.close();
  });

  test("default port is in use", async () => {
    process.env.HOST = "localhost";
    portBlocker = await blockPort(3000, "localhost");
    const port1 = await getPort({ port: 3000, portRange: [3000, 3100] });
    expect(port1).toEqual(3001);
    const port2 = await getPort();
    expect(port2).toEqual(3001);
    const port3 = await getPort(3000);
    expect(port3).not.toEqual(3001);
  });
});

describe("getPort: random", () => {
  test("{ random: true }", async () => {
    const port = await getPort({ random: true });
    expect(typeof port).toBe("number");
    expect(port).not.toBe(3000);
  });

  test("{ port: 0 }", async () => {
    let port = await getPort({ port: 0 });
    expect(typeof port).toBe("number");
    expect(port).not.toBe(3000);

    port = await getPort({ port: "0" as any });
    expect(typeof port).toBe("number");
    expect(port).not.toBe(3000);
  });
});

describe("errors", () => {
  test("invalid hostname", async () => {
    const error = await getPort({ host: "http://localhost:8080" }).catch(
      (error) => error,
    );
    expect(error.toString()).toMatchInlineSnapshot(
      '"Error: Invalid host: \\"http://localhost:8080\\""',
    );
  });

  test("unavailable hostname", async () => {
    const error = await getPort({
      host: "192.168.1.999",
    }).catch((error) => error);
    expect(error.toString()).toMatchInlineSnapshot(
      '"Error: Unable to find any random port on host \\"192.168.1.999\\""',
    );
  });

  test("unavailable hostname (no random)", async () => {
    const error = await getPort({
      host: "192.168.1.999",
      random: false,
    }).catch((error) => error);
    expect(error.toString()).toMatchInlineSnapshot(
      '"Error: Unable to find find available port on host \\"192.168.1.999\\" (tried 3000 and 3000-3100)"',
    );
  });
});
