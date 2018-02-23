type Dictionary<T> = { [id: string]: T };

type AsInterface<T> = { [K in keyof T]: T[K] };

// opaque types can provide semantic information to simpler types like strings etc
// read: https://codemix.com/opaque-types-in-javascript/
type Opaque<K, T> = T & { __TYPE__: K };

export type EthereumNetworkId = Opaque<"EthereumNetworkId", string>;
export type EthereumAddress = Opaque<"EthereumAddress", string>;
export type EthereumAddressWithChecksum = Opaque<"EthereumAddressWithChecksum", string>;
export type FunctionWithDeps = Opaque<"FunctionWithDeps", Function>;

type DeepPartial<T> = { [P in keyof T]?: DeepPartial<T[P]> };

//Taken from @types/reactstrap
// @see https://github.com/DefinitelyTyped/DefinitelyTyped/pull/23700
export type InputType =
  | "text"
  | "email"
  | "select"
  | "file"
  | "radio"
  | "checkbox"
  | "textarea"
  | "button"
  | "reset"
  | "submit"
  | "date"
  | "datetime-local"
  | "hidden"
  | "image"
  | "month"
  | "number"
  | "range"
  | "search"
  | "tel"
  | "url"
  | "week"
  | "password"
  | "datetime"
  | "time"
  | "color";
