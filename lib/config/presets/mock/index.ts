import fs from 'fs';
import path from 'path';

import { logger } from '../../../logger';
import type { Preset } from '../types';
import { fetchPreset } from '../util';

export function fetchJSONFile(
  repo: string,
  fileName: string,
  endpoint: string,
  packageTag?: string
): Promise<Preset> {
  const filePath = path.join(endpoint, repo, fileName);
  try {
    const rawFile = fs.readFileSync(filePath, { encoding: 'utf-8' });
    return Promise.resolve(JSON.parse(rawFile));
  } catch (err) {
    logger.debug({ err, repo }, `Failed to retrieve ${fileName} from repo`);
    return Promise.resolve(null);
  }
}

export function getPresetFromEndpoint(
  pkgName: string,
  presetName: string,
  presetPath: string,
  endpoint: string,
  packageTag?: string
): Promise<Preset> {
  return fetchPreset({
    pkgName,
    filePreset: presetName,
    presetPath,
    endpoint,
    packageTag,
    fetch: fetchJSONFile,
  });
}
