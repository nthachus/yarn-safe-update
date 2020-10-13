// @flow
import * as lockfile from '@yarnpkg/lockfile';
import semver from 'semver';

import type { Dependencies, LockfileObject, LockManifest, Manifest } from './yarn-api';
import { buildPackageData, parsePackageName, yarnInfo } from './yarn-api';

export type CollectedPackage = {
  versions: (?string)[],
  updated: boolean | string,
  pkg: LockManifest,
};

export type GroupedPackages = {
  [key: string]: CollectedPackage,
};

export type CollectedPackages = {
  [key: string]: GroupedPackages,
};

export const collectPackages = (json: LockfileObject, exclude?: RegExp): CollectedPackages => {
  const packages: CollectedPackages = {};

  Object.keys(json).forEach((name: string) => {
    const pkg: LockManifest = json[name];
    const [pkgName, version] = parsePackageName(name);

    if (!packages[pkgName]) packages[pkgName] = {};
    const group: GroupedPackages = packages[pkgName];

    if (!group[pkg.version]) group[pkg.version] = { pkg, versions: [], updated: false };
    const obj: CollectedPackage = group[pkg.version];

    obj.versions.push(version);

    if (!obj.updated) {
      if (exclude && exclude.test(name)) {
        obj.updated = true; // TODO: should be numeric
      } else if (version && semver.clean(version, true) === pkg.version) {
        obj.updated = true;
        console.log(' \x1b[32m%s\x1b[0m %s', '[  FIXED]', name);
      }
    }
  });

  return packages;
};

export const selectUpdates = (packages: CollectedPackages): LockfileObject => {
  const json: LockfileObject = {};

  Object.keys(packages).forEach((name) => {
    Object.keys(packages[name]).forEach((version) => {
      const obj = packages[name][version];
      if (typeof obj.updated === 'string') {
        obj.versions.forEach((range) => {
          json[typeof range === 'string' ? `${name}@${range}` : name] = obj.pkg;
        });
      }
    });
  });

  return json;
};

const isCompatibleVers = (
  newVer: string,
  oldVer: string,
  packages: CollectedPackages,
  name: string
): ?[string, CollectedPackage] => {
  const group: GroupedPackages = packages[name];
  const version = Object.keys(group).find((v: string) => group[v].versions.includes(oldVer));
  if (!version) {
    throw new Error(`Could not found package: ${name}@${oldVer}`);
  }

  const obj: CollectedPackage = group[version];
  if (!semver.satisfies(version, newVer, true)) {
    if (!obj.updated) {
      updateAPackage(packages, name, version); // eslint-disable-line no-use-before-define
    }

    if (typeof obj.updated !== 'string' || !semver.satisfies(obj.updated, newVer, true)) {
      return null;
    }
  }

  return [newVer, obj];
};

const isCompatibleDeps = (
  newDeps: ?Dependencies,
  oldDeps: ?Dependencies,
  packages: CollectedPackages
): ?Array<[string, CollectedPackage]> => {
  const list: Array<[string, CollectedPackage]> = [];

  if (!newDeps) return list;
  const newKeys: string[] = Object.keys(newDeps);
  if (!newKeys.length) return list;

  if (!oldDeps) return null;
  const oldKeys: string[] = Object.keys(oldDeps);
  if (!oldKeys.length) return null;

  if (newKeys.some((k: string) => !oldKeys.includes(k))) return null;

  const valid = newKeys.every((name: string) => {
    if (!newDeps[name] || !oldDeps[name]) return true;

    const newVer = semver.validRange(newDeps[name], true);
    const oldVer = semver.validRange(oldDeps[name], true);
    if (newVer === oldVer || newVer === '*' || oldVer === '*') return true;

    const item = isCompatibleVers(newDeps[name], oldDeps[name], packages, name);
    if (item) {
      list.push(item);
      return true;
    }

    return false;
  });

  return valid ? list : null;
};

const updateDepVersions = (depList: Array<[string, CollectedPackage]>): void => {
  depList.forEach((item) => {
    const [newVer, obj] = item;
    obj.versions.push(newVer);
    if (typeof obj.updated !== 'string') obj.updated = obj.pkg.version;
  });
};

const updateAPackage = (packages: CollectedPackages, name: string, version: string): void => {
  const obj: CollectedPackage = packages[name][version];
  if (obj.updated) return;

  const versions: ?(string[]) = yarnInfo(name, 'versions');
  if (!versions) {
    throw new Error(`Could not fetch package versions: ${name}`);
  }
  semver.rsort((versions: any[]), true);

  versions.some((ver: string) => {
    if (semver.lte(ver, version, true)) {
      obj.updated = true;

      console.log(' \x1b[32m%s\x1b[0m %s@%s', '[HIGHEST]', name, version);
      return true;
    }

    if (
      obj.versions.some(
        (range: ?string) => range && semver.satisfies(version, range, true) && !semver.satisfies(ver, range, true)
      )
    ) {
      return false;
    }

    const pkg: ?Manifest = yarnInfo(`${name}@${ver}`);
    if (!pkg) {
      throw new Error(`Could not fetch package info: ${name}@${ver}`);
    }

    const upOpts = isCompatibleDeps(pkg.optionalDependencies, obj.pkg.optionalDependencies, packages);
    if (!upOpts) return false;

    const upDeps = isCompatibleDeps(pkg.dependencies, obj.pkg.dependencies, packages);
    if (!upDeps) return false;

    obj.pkg = buildPackageData(pkg, obj.pkg);
    obj.updated = ver;
    updateDepVersions(upOpts.concat(upDeps));

    console.info(' \x1b[33m%s\x1b[0m %s@%s -> %s', '[ UPDATE]', name, version, ver);
    return true;
  });
};

export const updatePackages = (yarnLock: string, exclude?: RegExp): string => {
  const json: LockfileObject = lockfile.parse(yarnLock).object;
  const packages: CollectedPackages = collectPackages(json, exclude);

  Object.keys(packages).forEach((name: string) => {
    Object.keys(packages[name]).forEach((version: string) => {
      updateAPackage(packages, name, version);
    });
  });

  Object.assign(json, selectUpdates(packages));
  return lockfile.stringify(json);
};
