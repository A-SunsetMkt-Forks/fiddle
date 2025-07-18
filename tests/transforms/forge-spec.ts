import { ReleaseInfo } from '@electron/fiddle-core';
import { describe, expect, it, vi } from 'vitest';

import { PACKAGE_NAME } from '../../src/interfaces';
import { forgeTransform } from '../../src/renderer/transforms/forge';
import { getForgeVersion } from '../../src/renderer/utils/get-package';

describe('forgeTransform()', () => {
  it('adds forge dependencies', async () => {
    const filesBefore = new Map();
    filesBefore.set(PACKAGE_NAME, JSON.stringify({}));

    const files = await forgeTransform(filesBefore);
    const forgeVersion = getForgeVersion();
    expect(JSON.parse(files.get(PACKAGE_NAME)!)).toEqual({
      devDependencies: {
        '@electron-forge/cli': forgeVersion,
        '@electron-forge/maker-deb': forgeVersion,
        '@electron-forge/maker-rpm': forgeVersion,
        '@electron-forge/maker-squirrel': forgeVersion,
        '@electron-forge/maker-zip': forgeVersion,
      },
      scripts: {
        start: 'electron-forge start',
        package: 'electron-forge package',
        make: 'electron-forge make',
        publish: 'electron-forge publish',
        lint: 'echo "No linting configured"',
      },
      config: {
        forge: {
          packagerConfig: {},
          makers: [
            {
              name: '@electron-forge/maker-squirrel',
            },
            {
              name: '@electron-forge/maker-zip',
              platforms: ['darwin'],
            },
            {
              name: '@electron-forge/maker-deb',
              config: {},
            },
            {
              name: '@electron-forge/maker-rpm',
              config: {},
            },
          ],
        },
      },
      license: 'MIT',
    });
  });

  it('deals with errors', async () => {
    const filesBefore = new Map();
    filesBefore.set(PACKAGE_NAME, 'garbage');

    const files = await forgeTransform(filesBefore);
    expect(files.get(PACKAGE_NAME)).toBe('garbage');
  });

  it('forces ABI for nightly builds', async () => {
    vi.mocked(window.ElectronFiddle.getReleaseInfo).mockResolvedValue({
      version: '26.0.0-nightly.20230411',
      modules: '116',
    } as ReleaseInfo);
    const filesBefore = new Map();
    filesBefore.set(
      PACKAGE_NAME,
      JSON.stringify({
        devDependencies: {
          'electron-nightly': '26.0.0-nightly.20230411',
        },
      }),
    );

    const files = await forgeTransform(filesBefore);
    expect(JSON.parse(files.get(PACKAGE_NAME)!)).toMatchObject({
      config: {
        forge: {
          electronRebuildConfig: {
            forceABI: 116,
          },
        },
      },
    });
  });
});
