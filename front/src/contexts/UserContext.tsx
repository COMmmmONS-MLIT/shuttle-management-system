import React, { createContext, useContext, useState, useEffect } from "react";
import HttpClient from "@/adapter/HttpClient";
import Cookies from "js-cookie";
import { useRouter } from "next/router";
import {
  SuccessToast,
  ErrorToast,
} from "@/component/ReactHotToast/ToastMessage";

// types
import { User } from "@/types/user";
import AuthResponse from "@/types/ApiResponse/auth";

type UserContextType = {
  user: User | null;
  category: string | null;
  officeName: string | null;
  onlyScheduleCreate: boolean;
  role: "Admin" | "StaffAdmin" | "Staff" | "Customer" | null;
  canRequest: boolean;
  loading: boolean;
  error: Error | null;
  signIn: (email: string, password: string) => void;
  signOut: () => void;
};

const UserContext = createContext<UserContextType>({
  user: null,
  category: null,
  officeName: null,
  onlyScheduleCreate: false,
  role: null,
  canRequest: false,
  loading: true,
  error: null,
  signIn: () => {},
  signOut: () => {},
});

export const UserProvider = ({
  children,
  isAdmin = false,
}: {
  children: React.ReactNode;
  isAdmin?: boolean;
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [officeName, setOfficeName] = useState<string | null>(null);
  const [onlyScheduleCreate, setOnlyScheduleCreate] = useState<boolean>(false);
  const [role, setRole] = useState<
    "Admin" | "StaffAdmin" | "Staff" | "Customer" | null
  >(null);
  const [canRequest, setCanRequest] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const httpClient = new HttpClient();
  const pathname =
    typeof window !== "undefined" ? window.location.pathname : "";
  const isLoginPage =
    pathname === "/login" ||
    pathname === "/admin/login" ||
    pathname === "/users/login" ||
    pathname === "/install";
  const router = useRouter();

  const signIn = (email: string, password: string) => {
    const isAdmin = pathname.startsWith("/admin");
    const url = isAdmin ? "/admin/sign_in" : "/users/sign_in";
    const data = isAdmin
      ? { admin: { email, password } }
      : { user: { email, password } };

    httpClient
      .post<AuthResponse>(url, data, {
        headers: {
          Accept: "application/json",
        },
      })
      .then((res) => {
        SuccessToast(res.data.messages);
        setUser(res.data.user);
        setCategory(res.data.category);
        setOfficeName(res.data.office_name);
        setOnlyScheduleCreate(res.data.only_schedule_create);
        setRole(res.data.role);
        setCanRequest(res.data.can_request);
        Cookies.set("loggedIn", "true");

        const userRole = res.data.role;
        if (userRole === "Admin") {
          router.push("/admin");
        } else if (userRole === "Customer") {
          router.push("/users/select");
        } else {
          router.push("/");
        }
      })
      .catch((e) => {
        ErrorToast(e.response.data.error);
        Cookies.remove("loggedIn");
      });
  };

  const signOut = () => {
    const isAdmin = role === "Admin";
    const isCustomer = role === "Customer";
    const url = isAdmin ? "/admin/sign_out" : "/users/sign_out";
    httpClient.delete(url).catch(() => {});
    setUser(null);

    SuccessToast(["ログアウトしました。"]);
    const loginUrl = isAdmin
      ? "/admin/login"
      : isCustomer
        ? "/users/login"
        : "/login";
    Cookies.remove("loggedIn");
    router.push(loginUrl);
  };

  useEffect(() => {
    if (!isLoginPage) {
      const url = isAdmin ? "/admin/auth" : "/auth";

      httpClient
        .get<AuthResponse>(url)
        .then((res) => {
          setUser(res.data.user);
          setCategory(res.data.category);
          setOfficeName(res.data.office_name);
          setOnlyScheduleCreate(res.data.only_schedule_create);
          setRole(res.data.role);
          setCanRequest(res.data.can_request);
          setLoading(false);
          Cookies.set("loggedIn", "true");
        })
        .catch((err) => {
          setError(err);
          setLoading(false);
          Cookies.remove("loggedIn");
        });
    } else {
      setLoading(false);
    }
  }, [isAdmin]);

  return (
    <UserContext.Provider
      value={{
        user,
        category,
        officeName,
        onlyScheduleCreate,
        role,
        canRequest,
        loading,
        error,
        signIn,
        signOut,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
