/* tslint:disable */
/* eslint-disable */
export function create_matrix_char_data(chars: string, index: number): MatrixChar;
export function create_matrix_column_data(index: number, chars: string): MatrixColumn;
export function generate_matrix_config(column_count: number, charset: string): MatrixConfig;
export function generate_matrix_config_default(): MatrixConfig;
export function render_matrix_char(char_data: MatrixChar): HTMLElement;
export function render_matrix_column(column: MatrixColumn): HTMLElement;
export function create_particles(): void;
export function start_char_animation(charset: string): void;
export function calculate_column_position(index: number): number;
export function generate_animation_delay(): number;
export function generate_animation_duration(): number;
export function hello_world(): string;
export class MatrixChar {
  private constructor();
  free(): void;
  [Symbol.dispose](): void;
  readonly character: string;
  readonly animation_delay: number;
}
export class MatrixColumn {
  private constructor();
  free(): void;
  [Symbol.dispose](): void;
  readonly position: number;
  readonly delay: number;
  readonly duration: number;
  readonly chars: MatrixChar[];
}
export class MatrixConfig {
  private constructor();
  free(): void;
  [Symbol.dispose](): void;
  readonly columns: MatrixColumn[];
  readonly charset: string;
}

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly __wbg_matrixchar_free: (a: number, b: number) => void;
  readonly matrixchar_character: (a: number) => [number, number];
  readonly matrixchar_animation_delay: (a: number) => number;
  readonly __wbg_matrixcolumn_free: (a: number, b: number) => void;
  readonly matrixcolumn_delay: (a: number) => number;
  readonly matrixcolumn_duration: (a: number) => number;
  readonly matrixcolumn_chars: (a: number) => [number, number];
  readonly create_matrix_char_data: (a: number, b: number, c: number) => number;
  readonly create_matrix_column_data: (a: number, b: number, c: number) => number;
  readonly __wbg_matrixconfig_free: (a: number, b: number) => void;
  readonly matrixconfig_columns: (a: number) => [number, number];
  readonly matrixconfig_charset: (a: number) => [number, number];
  readonly generate_matrix_config: (a: number, b: number, c: number) => number;
  readonly generate_matrix_config_default: () => number;
  readonly render_matrix_char: (a: number) => [number, number, number];
  readonly render_matrix_column: (a: number) => [number, number, number];
  readonly create_particles: () => [number, number];
  readonly start_char_animation: (a: number, b: number) => [number, number];
  readonly calculate_column_position: (a: number) => number;
  readonly generate_animation_delay: () => number;
  readonly generate_animation_duration: () => number;
  readonly matrixcolumn_position: (a: number) => number;
  readonly hello_world: () => [number, number];
  readonly __wbindgen_exn_store: (a: number) => void;
  readonly __externref_table_alloc: () => number;
  readonly __wbindgen_export_2: WebAssembly.Table;
  readonly __wbindgen_export_3: WebAssembly.Table;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
  readonly __externref_drop_slice: (a: number, b: number) => void;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __wbindgen_realloc: (a: number, b: number, c: number, d: number) => number;
  readonly __externref_table_dealloc: (a: number) => void;
  readonly wasm_bindgen__convert__closures_____invoke__h92fe2e01305c860b: (a: number, b: number) => void;
  readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;
/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
*
* @returns {InitOutput}
*/
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
