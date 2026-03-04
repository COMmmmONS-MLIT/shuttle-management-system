import { NextRouter } from "next/router";
import { ParsedUrlQuery } from "querystring";

/**
 * router.query から検索用パラメータオブジェクトへ復元する
 */
export const parseQueryToParams = <T extends Record<string, any>>(
  query: ParsedUrlQuery,
  defaultParams: T
): T => {
  const result: T = { ...defaultParams };

  Object.keys(defaultParams).forEach((key) => {
    const valueFromQuery = query[key];
    if (valueFromQuery === undefined) return;

    const raw = Array.isArray(valueFromQuery)
      ? valueFromQuery[0]
      : valueFromQuery;
    if (raw === undefined) return;

    const defaultValue = (defaultParams as any)[key];

    // 空文字の場合
    if (raw === "") {
      if (defaultValue === null) {
        (result as any)[key] = null;
      } else if (typeof defaultValue === "string") {
        (result as any)[key] = "";
      }
      // number / boolean の場合はデフォルト値を維持
      return;
    }

    // boolean 文字列
    if (raw === "true") {
      (result as any)[key] = true;
      return;
    }
    if (raw === "false") {
      (result as any)[key] = false;
      return;
    }

    // number
    if (typeof defaultValue === "number") {
      const num = Number(raw);
      if (!Number.isNaN(num)) {
        (result as any)[key] = num;
      }
      return;
    }

    // それ以外は文字列として扱う
    (result as any)[key] = raw;
  });

  return result;
};

/**
 * 検索パラメータ + 追加パラメータ から URL クエリオブジェクトを生成
 */
export const buildQueryFromParams = <T extends Record<string, any>>(
  params: T,
  extra: Record<string, any> = {}
): Record<string, string> => {
  const query: Record<string, string> = {};
  const merged = { ...extra, ...params };

  Object.entries(merged).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    query[key] = String(value);
  });

  return query;
};

/**
 * 検索パラメータを URL クエリに反映（shallow push）
 */
export const pushSearchParamsToUrl = <T extends Record<string, any>>(
  router: NextRouter,
  params: T,
  extra: Record<string, any> = {}
) => {
  const query = buildQueryFromParams(params, extra);

  router.push(
    {
      pathname: router.pathname,
      query,
    },
    undefined,
    { shallow: true }
  );
};
