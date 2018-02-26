import { expect } from "chai";
import * as fetchMock from "fetch-mock";
import * as Yup from "yup";

import { expectToBeRejected } from "../../../../test/testUtils";
import { getSampleMalformedProducts, getSampleProducts, IProduct, productSchema } from "./fixtures";
import {
  JsonHttpClient,
  NetworkingError,
  ResponseParsingError,
  ResponseStatusError,
} from "./JsonHttpClient";

describe("JsonHttpClient", () => {
  const API_URL = "https://some-api.com/";

  afterEach(() => {
    expect(fetchMock.done()).to.be.true;
    fetchMock.restore();
  });

  describe("get requests", () => {
    it("should make GET request and parse the response", async () => {
      const mockedResponse = getSampleProducts();
      fetchMock.once(`${API_URL}products`, {
        status: 200,
        body: mockedResponse,
      });

      const httpClient = new JsonHttpClient();
      const actualResponse = await httpClient.get<IProduct[]>({
        baseUrl: API_URL,
        url: "products",
        responseSchema: Yup.array()
          .required()
          .of(productSchema),
      });

      expect(actualResponse.statusCode).to.be.eq(200);
      expect(actualResponse.body).to.be.deep.eq(mockedResponse);
    });

    it("should work with query parameters", async () => {
      const mockedResponse = getSampleProducts();
      fetchMock.once(`${API_URL}products?some=param&some2=param2`, {
        status: 200,
        body: mockedResponse,
      });

      const httpClient = new JsonHttpClient();
      const actualResponse = await httpClient.get<Array<IProduct>>({
        baseUrl: API_URL,
        url: "products",
        queryParams: {
          some: "param",
          some2: "param2",
        },
      });

      expect(actualResponse.statusCode).to.be.eq(200);
      expect(actualResponse.body).to.be.deep.eq(mockedResponse);
    });

    it("should work without baseUrl param", async () => {
      const mockedResponse = getSampleProducts();
      fetchMock.once(`${API_URL}products`, {
        status: 200,
        body: mockedResponse,
      });

      const httpClient = new JsonHttpClient();
      const actualResponse = await httpClient.get<IProduct[]>({
        url: `${API_URL}products`,
        responseSchema: Yup.array()
          .required()
          .of(productSchema),
      });

      expect(actualResponse.statusCode).to.be.eq(200);
      expect(actualResponse.body).to.be.deep.eq(mockedResponse);
    });

    it("should work with custom headers", async () => {
      const customHeaders = {
        apiToken: "some dummy token",
      };
      const mockedResponse = getSampleProducts();
      const requestMatcher: fetchMock.MockMatcherFunction = (url, opts) => {
        if (url !== `${API_URL}products`) {
          return false;
        }
        if (opts.method !== "GET") {
          return false;
        }
        if ((opts as any).headers.apiToken !== customHeaders.apiToken) {
          return false;
        }
        return true;
      };
      fetchMock.once(requestMatcher, {
        status: 200,
        body: mockedResponse,
      });

      const httpClient = new JsonHttpClient();
      const actualResponse = await httpClient.get<IProduct[]>({
        url: `${API_URL}products`,
        headers: customHeaders,
      });

      expect(actualResponse.statusCode).to.be.eq(200);
      expect(actualResponse.body).to.be.deep.eq(mockedResponse);
    });

    it("should throw an error on malformed response (missing fields)", async () => {
      const expectedResponse = getSampleMalformedProducts();
      fetchMock.mock(`${API_URL}products`, {
        status: 200,
        body: expectedResponse,
      });

      const httpClient = new JsonHttpClient();

      await expectToBeRejected(
        () =>
          httpClient.get<Array<IProduct>>({
            baseUrl: API_URL,
            url: "products",
            responseSchema: Yup.array()
              .required()
              .of(productSchema),
          }),
        new ResponseParsingError("[0].quantity is a required field"),
      );
    });

    it("should throw an error on malformed response (non json)", async () => {
      fetchMock.mock(`${API_URL}products`, {
        status: 200,
        body: "not a json",
        sendAsJson: false,
      });

      const httpClient = new JsonHttpClient();

      await expectToBeRejected(
        () =>
          httpClient.get<Array<IProduct>>({
            baseUrl: API_URL,
            url: "products",
            responseSchema: Yup.array()
              .required()
              .of(productSchema),
          }),
        new ResponseParsingError("Response is not a json"),
      );
    });

    it("should throw an error on non 20x response", async () => {
      const expectedErrorMessage = "error message";
      const expectedStatusCode = 500;
      fetchMock.mock(`${API_URL}products`, {
        status: expectedStatusCode,
        body: { errorMessage: expectedErrorMessage },
      });

      const httpClient = new JsonHttpClient();

      await expectToBeRejected(
        () =>
          httpClient.get<Array<IProduct>>({
            baseUrl: API_URL,
            url: "products",
            responseSchema: Yup.array()
              .required()
              .of(productSchema),
          }),
        new ResponseStatusError(API_URL + "products", 500),
      );
    });

    it("should throw an error on networking problems", async () => {
      fetchMock.mock(`${API_URL}products`, {
        throws: new Error("test"),
      });

      const httpClient = new JsonHttpClient();

      await expectToBeRejected(
        () =>
          httpClient.get<Array<IProduct>>({
            baseUrl: API_URL,
            url: "products",
            responseSchema: Yup.array()
              .required()
              .of(productSchema),
          }),
        new NetworkingError(API_URL + "products"),
      );
    });
  });

  describe("post requests", () => {
    it("should make POST request", async () => {
      const body = {
        name: "productC",
        quantity: 1,
      };
      const mockedResponse = getSampleProducts();
      const requestMatcher: fetchMock.MockMatcherFunction = (url, opts) => {
        if (url !== `${API_URL}products`) {
          return false;
        }
        if (opts.method !== "POST") {
          return false;
        }
        if ((opts as any).body !== JSON.stringify(body)) {
          return false;
        }
        return true;
      };
      fetchMock.postOnce(requestMatcher, {
        status: 201,
        body: mockedResponse,
      });

      const httpClient = new JsonHttpClient();
      const actualResponse = await httpClient.post<IProduct[]>({
        baseUrl: API_URL,
        url: "products",
        body: body,
        responseSchema: Yup.array()
          .required()
          .of(productSchema),
      });

      expect(actualResponse.statusCode).to.be.eq(201);
      expect(actualResponse.body).to.be.deep.eq(mockedResponse);
    });
  });

  describe("put requests", () => {
    it("should make PUT request", async () => {
      const body = {
        name: "productC",
        quantity: 1,
      };
      const mockedResponse = getSampleProducts();
      const requestMatcher: fetchMock.MockMatcherFunction = (url, opts) => {
        if (url !== `${API_URL}products`) {
          return false;
        }
        if (opts.method !== "PUT") {
          return false;
        }
        if ((opts as any).body !== JSON.stringify(body)) {
          return false;
        }
        return true;
      };
      fetchMock.putOnce(requestMatcher, {
        status: 200,
        body: mockedResponse,
      });

      const httpClient = new JsonHttpClient();
      const actualResponse = await httpClient.put<IProduct[]>({
        baseUrl: API_URL,
        url: "products",
        body: body,
        responseSchema: Yup.array()
          .required()
          .of(productSchema),
      });

      expect(actualResponse.statusCode).to.be.eq(200);
      expect(actualResponse.body).to.be.deep.eq(mockedResponse);
    });
  });

  describe("patch requests", () => {
    it("should make PATCH request", async () => {
      const body = {
        name: "productC",
        quantity: 1,
      };
      const mockedResponse = getSampleProducts();
      const requestMatcher: fetchMock.MockMatcherFunction = (url, opts) => {
        if (url !== `${API_URL}products`) {
          return false;
        }
        if (opts.method !== "PATCH") {
          return false;
        }
        if ((opts as any).body !== JSON.stringify(body)) {
          return false;
        }
        return true;
      };
      fetchMock.patchOnce(requestMatcher, {
        status: 200,
        body: mockedResponse,
      });

      const httpClient = new JsonHttpClient();
      const actualResponse = await httpClient.patch<IProduct[]>({
        baseUrl: API_URL,
        url: "products",
        body: body,
        responseSchema: Yup.array()
          .required()
          .of(productSchema),
      });

      expect(actualResponse.statusCode).to.be.eq(200);
      expect(actualResponse.body).to.be.deep.eq(mockedResponse);
    });
  });

  describe("delete requests", () => {
    it("should make DELETE request", async () => {
      const requestMatcher: fetchMock.MockMatcherFunction = (url, opts) => {
        if (url !== `${API_URL}products`) {
          return false;
        }
        if (opts.method !== "DELETE") {
          return false;
        }
        return true;
      };
      fetchMock.deleteOnce(requestMatcher, {
        status: 204,
      });

      const httpClient = new JsonHttpClient();
      const actualResponse = await httpClient.delete({
        baseUrl: API_URL,
        url: "products",
      });

      expect(actualResponse.statusCode).to.be.eq(204);
      expect(actualResponse.body).to.be.deep.equal({});
    });
  });

  describe("property name transformation", () => {
    it("should transform request body object props to snake case and vice versa", async () => {
      const requestBody = {
        someProperty: "hello",
        otherProperty: 1,
      };

      const expectedTransformedBody = {
        some_property: "hello",
        other_property: 1,
      };

      let receivedRequestBody: string = "";

      const requestMatcher: fetchMock.MockMatcherFunction = (_url, opts) => {
        receivedRequestBody = (opts as any).body;
        return true;
      };
      fetchMock.postOnce(requestMatcher, {
        status: 201,
        body: expectedTransformedBody,
      });
      const httpClient = new JsonHttpClient();
      const actualResponse = await httpClient.post<IProduct[]>({
        baseUrl: "/",
        url: "products",
        body: requestBody,
      });

      expect(JSON.parse(receivedRequestBody)).to.deep.equal(expectedTransformedBody);
      expect(actualResponse.body).to.deep.equal(requestBody);
    });
  });
});
