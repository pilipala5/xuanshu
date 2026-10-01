import { cpSync, mkdirSync, readFileSync, realpathSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, relative, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const vinextDist = dirname(fileURLToPath(import.meta.resolve("vinext")));
const { emitStandaloneOutput } = await import(
  pathToFileURL(join(vinextDist, "build", "standalone.js")).href
);

const { standaloneDir, copiedPackages } = emitStandaloneOutput({
  root,
  outDir: join(root, "dist"),
});

// Vinext's emitter copies dependencies, but its server runtime also imports
// these React peer dependencies outside the already bundled application.
const copied = new Set(copiedPackages);
const targetModules = join(standaloneDir, "node_modules");
function copyRuntimePackage(name, resolver, optional = false) {
  if (copied.has(name)) return;
  let packageJson;
  try {
    packageJson = realpathSync(resolver.resolve(`${name}/package.json`));
  } catch (error) {
    if (optional) return;
    throw error;
  }
  const source = dirname(packageJson);
  const target = join(targetModules, name);
  mkdirSync(dirname(target), { recursive: true });
  cpSync(source, target, {
    recursive: true,
    dereference: true,
    filter: (file) => !relative(source, file).split(sep).includes("node_modules"),
  });
  copied.add(name);
  const pkg = JSON.parse(readFileSync(packageJson, "utf8"));
  const dependencyResolver = createRequire(packageJson);
  for (const dependency of Object.keys({ ...pkg.dependencies, ...pkg.optionalDependencies })) {
    copyRuntimePackage(dependency, dependencyResolver, dependency in (pkg.optionalDependencies ?? {}));
  }
}
const rootResolver = createRequire(join(root, "package.json"));
for (const peer of ["react", "react-dom"]) copyRuntimePackage(peer, rootResolver);

console.log(`Server bundle: ${standaloneDir}`);
console.log(`Runtime packages: ${copied.size}`);
console.log("Start with: HOST=127.0.0.1 PORT=3011 node dist/standalone/server.js");
