/**
 * Every path the production image copies out of the repository must exist.
 *
 * WHY THIS IS A UNIT TEST AND NOT A DOCKER BUILD
 * ==============================================
 * Docker's COPY fails the build when its source is missing, and git does not track
 * empty directories. `apps/web/public` was referenced by the image and had never
 * existed, so the image could never have built -- and nobody found out until CI ran
 * the docker job for the first time:
 *
 *   ERROR: "/repo/apps/web/public": not found
 *
 * The obvious guard is "build the image in CI", which already exists and is exactly
 * what took several minutes to tell us. This runs in milliseconds, on a machine with
 * no Docker, and names the missing path.
 *
 * WHAT IT DELIBERATELY DOES NOT CHECK
 * ===================================
 * Sources under `.next/` are build output. They do not exist before `next build` and
 * asserting on them would make this fail on a clean checkout, which is the opposite
 * of useful. Only repository paths are checked.
 */

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

/** The repository root, from this file's location. */
const REPO = resolve(import.meta.dirname, "../../../../..");
const DOCKERFILE = resolve(REPO, "infra/docker/web.Dockerfile");

/** Build output, not repository content. See the module comment. */
const IS_BUILD_OUTPUT = /(^|\/)\.next\//;

/**
 * Every `COPY --from=<stage> <src> <dest>` source that names a path inside the repo.
 *
 * Sources are written as absolute container paths (`/repo/apps/web/public`) because
 * the builder stage's WORKDIR is `/repo`, so the repo-relative path is what follows.
 */
function copiedRepositoryPaths(dockerfile: string): string[] {
  const paths: string[] = [];
  for (const line of dockerfile.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("COPY ")) continue;
    // Only stage-to-stage copies name /repo paths; a plain `COPY . .` copies the
    // whole context and has nothing specific to verify.
    if (!trimmed.includes("--from=")) continue;
    for (const token of trimmed.split(/\s+/)) {
      if (!token.startsWith("/repo/")) continue;
      const relative = token.slice("/repo/".length);
      if (IS_BUILD_OUTPUT.test(relative)) continue;
      paths.push(relative);
    }
  }
  return paths;
}

describe("the production image", () => {
  it("has a Dockerfile to read", () => {
    expect(existsSync(DOCKERFILE)).toBe(true);
  });

  it("copies only repository paths that exist", () => {
    const dockerfile = readFileSync(DOCKERFILE, "utf8");
    const referenced = copiedRepositoryPaths(dockerfile);

    // If this is empty the test is vacuous, which would be worse than a failure:
    // it would pass while proving nothing, including after somebody rewrites the
    // COPY lines in a form this parser no longer recognises.
    expect(referenced.length).toBeGreaterThan(0);

    const missing = referenced.filter((path) => !existsSync(resolve(REPO, path)));
    expect(missing).toEqual([]);
  });

  it("keeps public/ present, because standalone output does not include it", () => {
    // Named explicitly as well as covered above: this is the one that broke, and a
    // future cleanup that deletes the .gitkeep should fail on a test that says why
    // rather than on a generic "a path is missing".
    expect(existsSync(resolve(REPO, "apps/web/public"))).toBe(true);
  });
});

describe("cache mounts", () => {
  // Railway's Dockerfile validator requires `id=s/<service id>-<target path>` and its
  // docs state that environment variables are invalid inside a cache mount id. So a
  // mount here means hardcoding one platform's service UUID into an image that
  // Compose and CI also build. There are none, and the API image made the same call.
  //
  // BuildKit accepts the plain form, and so did the CI docker job -- the only thing
  // that objected was a deployment, which is why this is asserted here.
  const RAILWAY_CACHE_ID = /id=s\/[0-9a-fA-F-]{36}-/;

  it("are absent, or carry the id Railway requires", () => {
    const dockerfile = readFileSync(DOCKERFILE, "utf8");
    const mounts = dockerfile
      .split("\n")
      .filter((line) => !line.trim().startsWith("#"))
      .flatMap((line) => line.match(/--mount=\S+/g) ?? [])
      .filter((spec) => spec.includes("type=cache"));

    const bad = mounts.filter((spec) => !RAILWAY_CACHE_ID.test(spec));
    expect(bad).toEqual([]);
  });
});
