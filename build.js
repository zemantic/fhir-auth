require("esbuild")
  .build({
    entryPoints: ["./src/index.ts"],
    bundle: true,
    platform: "node",
    outfile: "./dist/server.js",
    external: ["bcrypt"],
  })
  .catch(() => process.exit(1));
