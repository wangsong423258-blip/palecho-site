import { access, cp, mkdir, readdir, rm } from "node:fs/promises";
import { resolve } from "node:path";
import type { Plugin } from "vite";

async function exists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return false;
    throw error;
  }
}

export function sites(): Plugin {
  let root = process.cwd();

  return {
    name: "sites",
    apply: "build",
    configResolved(config) {
      root = config.root;
    },
    async closeBundle() {
      const outputDirectory = resolve(root, "dist", ".openai");
      const hostingConfig = resolve(root, ".openai", "hosting.json");
      const clientDirectory = resolve(root, "dist", "client");
      const serverDirectory = resolve(root, "dist", "server");

      await rm(outputDirectory, { recursive: true, force: true });
      await mkdir(outputDirectory, { recursive: true });
      if (await exists(hostingConfig)) {
        await cp(hostingConfig, resolve(outputDirectory, "hosting.json"));
      }

      // vinext mirrors every top-level public asset into both output trees.
      // Sites serves these files through the client asset binding, so retaining
      // the duplicate server copies only inflates the Worker upload.
      if (await exists(clientDirectory) && await exists(serverDirectory)) {
        const clientEntries = await readdir(clientDirectory, { withFileTypes: true });
        await Promise.all(
          clientEntries
            .filter((entry) => entry.isFile())
            .map((entry) => rm(resolve(serverDirectory, entry.name), { force: true })),
        );
      }
    },
  };
}
