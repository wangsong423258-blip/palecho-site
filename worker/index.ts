import handler from "vinext/server/app-router-entry";

interface AssetFetcher {
  fetch(request: Request): Promise<Response>;
}

interface Env {
  ASSETS: AssetFetcher;
}

interface ExecutionContext {
  waitUntil(promise: Promise<unknown>): void;
  passThroughOnException(): void;
}

const worker = {
  async fetch(
    request: Request,
    env: Env,
    context: ExecutionContext,
  ): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/") {
      const home = new URL("/index.html", request.url);
      return env.ASSETS.fetch(new Request(home, request));
    }

    if (/\.[a-z0-9]+$/i.test(url.pathname)) {
      const asset = await env.ASSETS.fetch(request);
      if (asset.status !== 404) return asset;
    }

    return handler.fetch(request, env, context);
  },
};

export default worker;
