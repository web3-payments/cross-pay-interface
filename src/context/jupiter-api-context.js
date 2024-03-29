import React, { useContext, useEffect, useMemo, useState } from "react";
import { Configuration, DefaultApi } from "@jup-ag/api";
import { TokenInfo, TokenListProvider } from "@solana/spl-token-registry";
import { CHAIN_ID } from "./constants";
import { TOKEN_LIST_URL } from "@jup-ag/core";
import { SOL_MINT } from "../utils/sol-transaction-helpers";

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

    if (tokenMap.size > 0) return
    (async () => {
      for (let i = 0; i < 3; i++) {
        try {
          const [indexedRouteMapResult, tokens] = await Promise.all([
            api.v4IndexedRouteMapGet(),
            fetch(TOKEN_LIST_URL[process.env.REACT_APP_TOKEN_LIST_CLUSTER])
              .then(response => response.json())
          ]);
          // console.log(indexedRouteMapResult);
          // console.log(tokens);
          const tokenList = tokens
          const { indexedRouteMap = {}, mintKeys = [] } = indexedRouteMapResult;

          const routeMap = Object.keys(indexedRouteMap).reduce((routeMap, key) => {
            routeMap.set(
              mintKeys[Number(key)],
              indexedRouteMap[key].map((index) => mintKeys[index])
            );
            return routeMap;
          }, new Map());

          const tknMap = tokenList.reduce((map, item) => {
            map.set(item.address, item);
            return map;
          }, new Map())
          const tknNameMap = tokenList.reduce((map, item) => {
            map.set(item.name, item);
            return map;
          }, new Map())

          if (tknNameMap.size > 0 && tknMap.size > 0 && routeMap.size > 0) {

            //change wrapped-sol to sol
            const wSol = tknMap.get(SOL_MINT)
            wSol.name = "SOL"
            tknMap.set(SOL_MINT, wSol)
            
            //update tknNameMap
            tknNameMap.set("SOL", wSol)
            setTokenMap(
              tknMap
            );
            setTokenNameMap(
              tknNameMap
            );
            setRouteMap(routeMap);
            setLoaded(true);
            break
          }else{
            setLoaded(false)
          }
        } catch (error) {

        }
      }

    })();
  }, []);

  return (
    // api.v4QuoteGet({})
    <JupiterApiContext.Provider value={{ api, routeMap, tokenMap, tokenNameMap, loaded }}>
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