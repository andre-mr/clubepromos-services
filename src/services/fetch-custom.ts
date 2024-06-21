import { HttpsProxyAgent } from "https-proxy-agent";
// import nodeFetch, { RequestInit as NodeFetchRequestInit, Response as NodeFetchResponse } from "node-fetch";
const nodeFetch = require("node-fetch");
type NodeFetchRequestInit = import("node-fetch").RequestInit;
type NodeFetchResponse = import("node-fetch").Response;

interface FetchOptions {
  url: string;
  proxyEndpoint?: string;
  headers?: { [key: string]: string };
  method?: string;
  body?: string | null;
  referrerPolicy?: ReferrerPolicy;
  referrer?: string;
}

function createRequestOptions({
  proxyEndpoint,
  headers,
  method,
  body,
  referrerPolicy,
  referrer,
}: {
  proxyEndpoint?: string;
  headers?: { [key: string]: string };
  method?: string;
  body?: string;
  referrerPolicy?: ReferrerPolicy;
  referrer?: string;
}): NodeFetchRequestInit {
  const options: NodeFetchRequestInit = {};

  if (proxyEndpoint) {
    options.agent = new HttpsProxyAgent(proxyEndpoint);
  }

  if (method) {
    options.method = method;
  }

  if (body) {
    options.body = body;
  }

  if (referrerPolicy) {
    // options.referrerPolicy = referrerPolicy;
    if (!headers) headers = {};
    headers["Referrer-Policy"] = referrerPolicy;
  }

  if (referrer) {
    // options.referrer = referrer;
    if (!headers) headers = {};
    headers["Referer"] = referrer;
  }

  if (headers) {
    options.headers = headers;
  }

  return options;
}

const fetchBasic = async ({ url, proxyEndpoint }: FetchOptions): Promise<Response | NodeFetchResponse> => {
  if (proxyEndpoint) {
    console.log("fetchBasic", url, "using proxy");
  }

  const options = createRequestOptions({ proxyEndpoint });
  if (proxyEndpoint) {
    return nodeFetch(url, options as NodeFetchRequestInit);
  } else {
    return fetch(url);
  }
};

const fetchHtml = async ({ url, proxyEndpoint }: FetchOptions): Promise<Response | NodeFetchResponse> => {
  if (proxyEndpoint) {
    console.log("fetchHtml", url, "using proxy");
  }

  const headers = {
    accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
    "accept-language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7,es;q=0.6,pt-PT;q=0.5",
    "cache-control": "no-cache",
    "device-memory": "8",
    downlink: "10",
    dpr: "1",
    ect: "4g",
    pragma: "no-cache",
    priority: "u=0, i",
    rtt: "0",
    "sec-ch-device-memory": "8",
    "sec-ch-dpr": "1",
    "sec-ch-ua": '"Microsoft Edge";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"Windows"',
    "sec-ch-ua-platform-version": '"10.0.0"',
    "sec-ch-viewport-width": "1872",
    "sec-fetch-dest": "document",
    "sec-fetch-mode": "navigate",
    "sec-fetch-site": "same-origin",
    "sec-fetch-user": "?1",
    "upgrade-insecure-requests": "1",
    "viewport-width": "1872",
    "user-agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, como Gecko) Chrome/125.0.0.0 Safari/537.36",
  };
  const options = createRequestOptions({
    proxyEndpoint,
    headers,
    method: "GET",
    referrerPolicy: "strict-origin-when-cross-origin",
  });
  if (proxyEndpoint) {
    return nodeFetch(url, options as NodeFetchRequestInit);
  } else {
    return fetch(url, options as RequestInit);
  }
};

const fetchJSON = async ({
  proxyEndpoint,
  url,
  headers,
  method,
  body,
  referrer,
}: FetchOptions): Promise<Response | NodeFetchResponse> => {
  if (proxyEndpoint) {
    console.log("fetchJSON", url, "using proxy");
  }

  const options = createRequestOptions({
    proxyEndpoint,
    headers: headers || {
      accept: "application/json",
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, como Gecko) Chrome/125.0.0.0 Safari/537.36",
    },
    method,
    body: body || undefined,
    referrer,
  });
  if (proxyEndpoint) {
    return nodeFetch(url, options as NodeFetchRequestInit);
  } else {
    return fetch(url, options as RequestInit);
  }
};

export { fetchBasic, fetchHtml, fetchJSON };
