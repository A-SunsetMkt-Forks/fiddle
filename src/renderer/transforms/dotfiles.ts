import { Files } from '../../interfaces';

/**
 * This transform adds dotfiles (like .gitignore)
 *
 * @param {Files} files
 * @returns {Files}
 */
export function dotfilesTransform(files: Files): Files {
  files['.gitignore'] = 'node_modules\nout';

  return files;
}
