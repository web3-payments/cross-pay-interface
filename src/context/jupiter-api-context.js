import React, { useContext, useEffect, useMemo, useState } from "react";
import { Configuration, DefaultApi } from "@jup-ag/api";
import { TokenInfo, TokenListProvider } from "@solana/spl-token-registry";
import { CHAIN_ID } from "./constants";
import { TOKEN_LIST_URL } from "@jup-ag/core";

const JupiterApiContext = React.createContext(null);

export const JupiterApiProvider = ({ children }) => {
  const [tokenMap, setTokenMap] = useState(new Map());
  const [tokenNameMap, setTokenNameMap] = useState(new Map());
  const [routeMap, setRouteMap] = useState(new Map());
  const [loaded, setLoaded] = useState(false);
  const api = useMemo(() => {
    const config = new Configuration({ basePath: "https://quote-api.jup.ag" });
    return new DefaultApi(config);
  }, []);


  useEffect(() => {
    (async () => {
      const [indexedRouteMapResult, tokens] = await Promise.all([
        api.v4IndexedRouteMapGet(),
        fetch(TOKEN_LIST_URL[process.env.REACT_APP_TOKEN_LIST_CLUSTER])
          .then(response => response.json())
      ]);

      const tokenList = tokens
      const { indexedRouteMap = {}, mintKeys = [] } = indexedRouteMapResult;

      const routeMap = Object.keys(indexedRouteMap).reduce((routeMap, key) => {
        routeMap.set(
          mintKeys[Number(key)],
          indexedRouteMap[key].map((index) => mintKeys[index])
        );
        return routeMap;
      }, new Map());

      setTokenMap(
        tokenList.reduce((map, item) => {
          map.set(item.address, item);
          return map;
        }, new Map())
      );
      setTokenNameMap(
        tokenList.reduce((map, item) => {
          map.set(item.name, item);
          return map;
        }, new Map())
      );
      setRouteMap(routeMap);
      setLoaded(true);
    })();
  }, []);

  return (
    <JupiterApiContext.Provider value={{ api, routeMap, tokenMap, tokenNameMap,loaded }}>
      {children}
    </JupiterApiContext.Provider>
  );
}

export const useJupiterApiContext = () => {
  const context = useContext(JupiterApiContext);

  if (!context) {
    throw new Error(
      "useJupiterApiContext must be used within a JupiterApiProvider"
    );
  }

  return context;
};