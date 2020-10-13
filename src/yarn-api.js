// @flow
import { execSync } from 'child_process';

export const yarnInfo = (pkg: string, field: ?string = null): any => {
  const out = execSync(`yarn info --json "${pkg}" ${field || ''}`);

  const m = /^{"type":"inspect".*}\s*$/m.exec(String(out));
  if (!m) throw new Error(out.toString().trim());

  return JSON.parse(m[0]).data;
};

export const parsePackageName = (name: string): [string, ?string] => {
  const i = name.lastIndexOf('@');
  return i > 0 ? [name.substr(0, i), name.substr(i + 1)] : [name, null];
};

export const escapeRegex = (text: string): string => text.replace(/[\\^$.*+?()[\]{}|]/g, '\\$&');

// `dependencies` field in package info
export type Dependencies = {
  [key: string]: string,
};

// package.json
export type Manifest = {
  version: string,
  dist?: {
    tarball: string,
    shasum: string,
    integrity?: ?string,
  },
  dependencies?: Dependencies,
  peerDependencies?: Dependencies,
  optionalDependencies?: Dependencies,
};

export type LockManifest = {
  version: string,
  resolved: ?string,
  integrity?: ?string,
  optionalDependencies: ?Dependencies,
  dependencies: ?Dependencies,
};

export type LockfileObject = {
  [key: string]: LockManifest,
};

export const resolvePackageUrl = (pkg: Manifest, oldPkg: LockManifest): ?string => {
  let url: string;
  if (pkg.dist && pkg.dist.tarball) {
    url = pkg.dist.tarball.replace('.npmjs.org/', '.yarnpkg.com/');
  } else if (oldPkg.resolved) {
    url = oldPkg.resolved
      .replace(new RegExp(`\\b${escapeRegex(oldPkg.version)}\\b`), pkg.version)
      .replace(/#[^#]*$/, '');
  } else {
    return null;
  }
  return pkg.dist && pkg.dist.shasum ? `${url}#${pkg.dist.shasum}` : url;
};

export const isEmptyObject = (obj: any): boolean => !obj || !Object.keys(obj).length;

export const buildPackageData = (pkg: Manifest, oldPkg: LockManifest): LockManifest => ({
  version: pkg.version,
  resolved: resolvePackageUrl(pkg, oldPkg),
  integrity: pkg.dist && pkg.dist.integrity,
  dependencies: isEmptyObject(pkg.dependencies) ? null : pkg.dependencies,
  optionalDependencies: isEmptyObject(pkg.optionalDependencies) ? null : pkg.optionalDependencies,
});
