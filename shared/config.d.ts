import type RawConfig from '../config.example.json';


type Config<TConfig = typeof RawConfig> = {
  [TProperty in keyof TConfig]:
  TConfig[TProperty] extends Record<PropertyKey, unknown>
    ? Config<TConfig[TProperty]>
    : TConfig[TProperty] extends never[]
      ? string[] // We only have arrays of strings
      : TConfig[TProperty]
}

declare const config: Config;
export default config;
