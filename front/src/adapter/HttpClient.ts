// lib/httpClient.ts（例ファイル名）

import axios, {
  AxiosInstance,
  AxiosResponse,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from "axios";
import Cookies from "js-cookie";
import { loader } from "@/component/Widgets/Loader";
import { ErrorToast } from "@/component/ReactHotToast/ToastMessage";

interface CustomAxiosRequestConfig extends AxiosRequestConfig {
  skipLoading?: boolean;
}

interface CustomInternalAxiosRequestConfig extends InternalAxiosRequestConfig {
  skipLoading?: boolean;
}

export default class HttpClient {
  private axios: AxiosInstance;

  constructor() {
    this.axios = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL,
      withCredentials: true,
    });

    this.axios.interceptors.request.use(
      (config: CustomInternalAxiosRequestConfig) => {
        if (!config.skipLoading) {
          loader.startLoading();
        }
        const csrfToken = Cookies.get("XSRF-TOKEN");
        if (csrfToken) {
          config.headers["X-CSRF-Token"] = csrfToken;
        }
        return config;
      }
    );

    this.axios.interceptors.response.use(
      (res) => {
        const config = res.config as CustomAxiosRequestConfig;
        if (!config.skipLoading) {
          loader.stopLoading();
        }
        return res;
      },
      (err) => {
        const config = err.config as CustomAxiosRequestConfig;
        if (!config.skipLoading) {
          loader.stopLoading();
        }
        // エラー処理はそのまま
        const { status, data } = err.response || {};
        if (status === 419) ErrorToast(data.messages);
        else if (status === 401 && data.error === "Unauthenticated") {
          ErrorToast("ログインしてください");
          window.location.href = window.location.pathname.startsWith("/admin")
            ? "/admin/login"
            : "/login";
        } else if (status === 500) {
          ErrorToast("サーバーでエラーが発生しました");
        }
        return Promise.reject(err);
      }
    );
  }

  public get<T>(url: string, options?: CustomAxiosRequestConfig) {
    return this.axios.get<T>(url, options);
  }
  public post<T>(url: string, body?: any, options?: CustomAxiosRequestConfig) {
    return this.axios.post<T>(url, body, options);
  }
  public put<T>(url: string, body?: any, options?: CustomAxiosRequestConfig) {
    return this.axios.put<T>(url, body, options);
  }
  public delete<T>(
    url: string,
    body?: any,
    options?: CustomAxiosRequestConfig
  ) {
    return this.axios.delete<T>(url, { ...options, data: body });
  }
}
