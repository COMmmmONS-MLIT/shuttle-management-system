import { useEffect } from "react";
import "../styles/css/style.css";
import "../styles/css/print.css";
import "../styles/css/fontawesome.css";
import "../styles/css/calendarTimeline.css";
import "../styles/css/reactImageCrop.css";
import "../styles/css/loading.css";
import "../styles/css/selfVisits.css";
import "../styles/css/errorMessage.css";
import type { AppProps } from "next/app";
import Layout from "@/component/layouts/Layout";
import { Toaster } from "react-hot-toast";
import { LoaderElement } from "@/component/Widgets/Loader";
import { UserProvider, useUser } from "@/contexts/UserContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { getLayoutType } from "@/config/sidebar/CategoryConfig";
import { checkPageAccess } from "@/config/PageAccess";

function AuthWrapper({ Component, router }: AppProps) {
  const { user, category, role, loading } = useUser();

  const layoutType = getLayoutType(router.pathname, category || "default");

  // bodyクラス設定
  useEffect(() => {
    document.body.className = layoutType;
    if (layoutType === "admin-login") document.body.className = "admin";
    if (layoutType === "users-login") document.body.className = "users";
  }, [layoutType]);

  if (loading) return null;

  const isAuthenticated = !!user;

  if (role) {
    const { allowed, redirectTo } = checkPageAccess(
      role,
      router.pathname,
      category || undefined,
    );

    if (!allowed && redirectTo !== router.pathname) {
      router.replace(redirectTo);
      return null;
    }

    if (!allowed) {
      return null;
    }
  }

  const layout = () => {
    const ComponentAny = Component as any;

    if (router.pathname === "/404") {
      return <ComponentAny />;
    }

    switch (layoutType) {
      case "map":
      case "print":
      case "users":
        return isAuthenticated ? <ComponentAny /> : null;
      case "login":
      case "admin-login":
      case "users-login":
        return <ComponentAny />;
      default:
        return isAuthenticated ? (
          <Layout type={layoutType}>
            <ComponentAny />
          </Layout>
        ) : null;
    }
  };

  return (
    <>
      {layout()}
      <Toaster position="top-right" />
      <LoaderElement />
    </>
  );
}

export default function MaasApp(props: AppProps) {
  const isAdmin = props.router.pathname.startsWith("/admin");
  return (
    <UserProvider isAdmin={isAdmin}>
      <NotificationProvider>
        <AuthWrapper {...props} />
      </NotificationProvider>
    </UserProvider>
  );
}
