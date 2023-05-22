import axios from "axios";

export function makeGenericCall({ method, endpoint, plOptional }) {
  // payload -> pl = {body:{bodyKey:"bodyValue"},params:"req.param",headers:{headerKey:"headerValue"},query:{queryKey:"queryValue"}}
  // callback -> cb = (err, ress) => "handle api response"
  return async function (pl, cb) {
    // If payload is not passed and callback is, replace payload variable with callback variable
    if (typeof pl === "function") (cb = pl), (pl = null);

    // Handle case if payload is required and not provided
    if (!plOptional && !pl) {
      console.warn(
        "[AGA Library] - You need to provide a payload. Check aga('docs') for more details"
      );
      return;
    }

    // Check if passed payload is an object and if attributes exist
    function isPlOk(attribute) {
      return pl && typeof pl === "object" && pl[attribute] != undefined;
    }

    try {
      const options = {
        method,
        withCredentials: true,
        baseURL: window.aga.rootUrl
      };

      endpoint = endpoint != undefined ? endpoint : "";
      const params = isPlOk("params") ? pl.params : "";
      const url = endpoint + params;

      url.length && (options.url = url);
      if (isPlOk("headers")) options.headers = pl.headers;
      if (isPlOk("query")) options.params = pl.query;
      if (isPlOk("body")) options.data = pl.body;
      // Axios does not send arrays as req.body. Stringify array before sending
      if (isPlOk("body") && Array.isArray(pl.body))
        options.transformRequest = [
          function (data, headers) {
            const appJson = { "Content-Type": "application/json" };
            (headers.patch = appJson),
              (headers.post = appJson),
              (headers.put = appJson);
            return JSON.stringify(data);
          }
        ];
      // Note: Axios does not send req.body with GET request

      const res = await axios(options);

      typeof cb === "function" && cb(null, res.data);

      return res.data;
    } catch (err) {
      typeof cb === "function" && cb(err, null);
      console.warn("[AGA Library] - Error making API call: ", err.message);
      return err;
    }
  };
}
