import * as cp from "child_process";
import * as esbuild from "esbuild";

export const bundleFile = async (
  entryPoint: string,
  outfile: string,
  tsconfigPath?: string,
): Promise<void> => {
  const buildOptions: esbuild.BuildOptions = {
    entryPoints: [entryPoint],
    bundle: true,
    platform: "node",
    packages: "external",
    outfile: outfile,
    sourcemap: "inline",
    logLevel: "silent",
  };

  console.log("[Vanta] Bundling file:", entryPoint, "to", outfile);

  if (tsconfigPath) {
    console.log("[Vanta] Using tsconfig:", tsconfigPath);
    buildOptions.tsconfig = tsconfigPath;
  }

  try {
    await esbuild.build(buildOptions);
    console.log("[Vanta] Bundle successful");
  } catch (error) {
    console.error("[Vanta] Bundle failed:", error);
    throw error;
  }
};

export const runFile = (filePath: string, cwd: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    console.log("[Vanta] Running file:", filePath);
    const child = cp.spawn("node", ["--enable-source-maps", filePath], {
      cwd: cwd,
    });

    let output = "";
    child.stdout.on("data", (d) => {
      const str = d.toString();
      console.log("[Vanta] stdout:", str);
      output += str;
    });
    child.stderr.on("data", (d) => {
      const str = d.toString();
      console.log("[Vanta] stderr:", str);
      output += str;
    });

    child.on("close", (code) => {
      console.log("[Vanta] Process exited with code:", code);
      resolve(output);
    });

    child.on("error", (err) => {
      console.error("[Vanta] Process error:", err);
      reject(err);
    });
  });
};
