/**
 * Wraps fetch with JSON based, injectable wrapper.
 *
 * Converts camel cased body properties to snake case on requests,
 * and does the reverse on responses.
 *
 * It supports validating response shape. Validation happens AFTER camelCasing.
 */

import { injectable } from "inversify";
import { compact } from "lodash";
import * as queryString from "query-string";
import * as urlJoin from "url-join";
import { Dictionary } from "../../../types";
import { invariant } from "../../../utils/invariant";
import { toCamelCase, toSnakeCase } from "../../../utils/transformObjectKeys";
import {
  HttpMethod,
  IHttpClient,
  IHttpClientErrorDocument,
  IHttpGetRequest,
  IHttpPostRequest,
  IHttpRequestCommon,
  IHttpResponse,
} from "./IHttpClient";

export class HttpClientError extends Error {
  protected type: string;
  protected details: IHttpClientErrorDocument;
  constructor(
    instance: string,
    type: string = "HTTPClientError",
    title: string = "There was an error connecting to the network",
    status: number = 0,
  ) {
    super(type);
    this.type = type;
    this.details = {
      type,
      status,
      title,
      instance,
    };
  }
}

export class ResponseParsingError extends HttpClientError {
  constructor(instance: string) {
    super(instance, "ResponseParsingError", "There was an error parsing the result of the server");
  }
}

export class ResponseStatusError extends HttpClientError {
  constructor(instance: string, public readonly status: number) {
    super(instance, "ResponseStatusError", "There was an error connecting to the network", status);
  }
}

export class NetworkingError extends HttpClientError {
  constructor(instance: string) {
    super(instance, "NetworkingError", "There was an error connecting to the network");
  }
}

//supports only JSON apis
@injectable()
export class JsonHttpClient implements IHttpClient {
  private readonly jsonRequestHeaders: Dictionary<string> = {
    Accept: "application/json, text/plain, */*",
    "Content-Type": "application/json",
  };

  private readonly formDataRequestHeaders: Dictionary<string> = {
    Accept: "application/json, text/plain, */*",
  };

  public async get<T>(config: IHttpGetRequest): Promise<IHttpResponse<T>> {
    const qs = config.queryParams ? "?" + queryString.stringify(config.queryParams) : null;
    // we need to remove falsy values because urlJoin is retarded and ads trailing slashes otherwise
    const urlParts = compact([config.baseUrl, config.url, qs]);
    const fullUrl = urlJoin(...urlParts);

    return this.makeFetchRequest<T>(fullUrl, "GET", config);
  }

  public post<T>(config: IHttpPostRequest): Promise<IHttpResponse<T>> {
    const urlParts = compact([config.baseUrl, config.url]);
    const fullUrl = urlJoin(...urlParts);

    return this.makeFetchRequest<T>(fullUrl, "POST", config);
  }

  public put<T>(config: IHttpPostRequest): Promise<IHttpResponse<T>> {
    const urlParts = compact([config.baseUrl, config.url]);
    const fullUrl = urlJoin(...urlParts);

    return this.makeFetchRequest<T>(fullUrl, "PUT", config);
  }

  public patch<T>(config: IHttpPostRequest): Promise<IHttpResponse<T>> {
    const urlParts = compact([config.baseUrl, config.url]);
    const fullUrl = urlJoin(...urlParts);

    return this.makeFetchRequest<T>(fullUrl, "PATCH", config);
  }

  public delete(config: IHttpPostRequest): Promise<IHttpResponse<any>> {
    const urlParts = compact([config.baseUrl, config.url]);
    const fullUrl = urlJoin(...urlParts);

    return this.makeFetchRequest<any>(fullUrl, "DELETE", { ...config, expectsNoResponse: true });
  }

  private async makeFetchRequest<T>(
    fullUrl: string,
    method: HttpMethod,
    config: IHttpRequestCommon,
  ): Promise<IHttpResponse<T>> {
    let response;

    try {
      let body: string | FormData | undefined = config.body
        ? JSON.stringify(toSnakeCase(config.body))
        : undefined;

      let headers = config.formData ? this.formDataRequestHeaders : this.jsonRequestHeaders;

      headers = {
        ...headers,
        ...config.headers,
      };

      if (config.formData) {
        body = config.formData;
        invariant(!headers["Content-Type"], "With form-data you can't set content-type header");
      }

      response = await fetch(fullUrl, {
        headers,
        method,
        body,
      });
    } catch {
      throw new NetworkingError(fullUrl);
    }

    if (!response.ok && !isAllowedStatusCode(config.allowedStatusCodes, response.status)) {
      throw new ResponseStatusError(fullUrl, response.status);
    }

    let responseJson: any = {};

    if (response.body && !config.expectsNoResponse) {
      responseJson = await response.json().catch(() => {
        throw new ResponseParsingError("Response is not a json");
      });
    }

    let finalResponseJson: T = toCamelCase(responseJson);
    if (config.responseSchema && response.ok) {
      // we dont validate response on non success statuses
      try {
        finalResponseJson = config.responseSchema.validateSync<T>(toCamelCase(responseJson), {
          stripUnknown: true,
        }) as T;
      } catch (e) {
        throw new ResponseParsingError(e.message);
      }
    }

    return {
      statusCode: response.status,
      body: finalResponseJson,
    };
  }
}

function isAllowedStatusCode(allowedStatusCodes: number[] | undefined, status: number): boolean {
  if (!allowedStatusCodes) {
    return false;
  }

  return allowedStatusCodes.indexOf(status) !== -1;
}
