import { readFileSync } from "node:fs";
import vinext from "vinext";
import { defineConfig } from "vite";

export default defineConfig(async () => {
  if (process.env.XUANSHU_SITES !== "1") {
    return { plugins: [vinext()] };
  }

  // The optional Sites target uses a local, ignored hosting configuration.
  const hostingConfig = JSON.parse(readFileSync(new URL("./.openai/hosting.json", import.meta.url), "utf8"));
  const { sites } = await import("@openai/sites-vite-plugin");
  process.env.WRANGLER_WRITE_LOGS ??= "false";
  process.env.WRANGLER_LOG_PATH ??= ".wrangler/logs";
  process.env.MINIFLARE_REGISTRY_PATH ??= ".wrangler/registry";
  const { cloudflare } = await import("@cloudflare/vite-plugin");
  return {
    plugins: [
      vinext(),
      sites(),
      cloudflare({
        viteEnvironment: { name: "rsc", childEnvironments: ["ssr"] },
        config: {
          main: "./worker/index.ts",
          compatibility_flags: ["nodejs_compat"],
          d1_databases: [],
          r2_buckets: [],
        },
      }),
    ],
    define: { __XUANSHU_PROJECT__: JSON.stringify(hostingConfig.project_id) },
  };
});
