import { Plugin } from 'rollup';

export interface RactiveOptions {
  /**
   * File extensions to process.
   *
   * @default ['.ractive.html', '.ractive', '.ract.html', '.ract']
   */
  extensions?: string[];

  /**
   * Path prefix to limit processing.
   * 
   * Recommended: 'views'
   */
  root?: string;

  /**
   * Automatically export { template, css? } for templates with no script (code) sections.
   */
  autoExport?: boolean;

  /**
   * Rename processed template files using this extension, if provided. This does not apply if no `outputDir` is provided.
   */
  outputExtension?: string;

  /**
   * Path to write processed templates. This is useful for other rollup plugins that don't use rollup to resolve imports, like plugin-typescript.
   */
  outputDir?: string;


  /**
   * Set the mustache delimiters used by the ractive parser.
   *
   * @default ['{{', '}}']
   */
  delimiters?: [string, string];

  /**
   * Set the static mustache delimiters used by the ractive parser.
   *
   * @default ['[[', ']]']
   */
  staticDelimiters?: [string, string];

  /**
   * Set the triple mustache delimiters used by the ractive parser.
   *
   * @default ['{{{', '}}}']
   */
  tripleDelimiters?: [string, string];

  /**
   * Set the static triple mustache delimiters used by the ractive parser.
   *
   * @default ['[[[', ']]]']
   */
  staticTripleDelimiters?: [string, string];

  /**
   * Output non-ascii characters in templates as unicode escape sequences.
   *
   * @default false
   */
  escapeUnicode?: boolean;

  /**
   * Output a js function for each expression in the template to avoid having to build it at runtime.
   *
   * @default true
   */
  csp?: boolean;
}

/**
 * Compile Ractive templates into ES modules.
 */
export default function ractive(opts?: RactiveOptions): Plugin;
