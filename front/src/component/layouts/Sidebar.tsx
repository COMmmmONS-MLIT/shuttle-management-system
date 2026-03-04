import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";

// fontawesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSignOutAlt,
  faTachometerAlt,
  faThLarge,
  faThList,
  faMap,
  faPrint,
  faBell,
} from "@fortawesome/free-solid-svg-icons";

// contexts
import { useUser } from "@/contexts/UserContext";
import { useNotification } from "@/contexts/NotificationContext";
import CategoryNavigation from "@/component/layouts/CategoryNavigation";

export default function SideBar() {
  const router = useRouter();
  const { category, role, signOut } = useUser();
  const { unreadNotificationCount } = useNotification();
  const [barOpen, setBarOpen] = useState<Boolean>(false);
  const [openListIndex, setOpenListIndex] = useState<number>(0);
  const barOpenToggle = () => {
    setBarOpen(!barOpen);
  };
  const isAdminPage = () => {
    return router.pathname.startsWith("/admin");
  };

  useEffect(() => {
    const barClose = () => {
      setBarOpen(false);
    };
    router.events.on("routeChangeComplete", barClose);

    return () => {
      router.events.off("routeChangeComplete", barClose);
    };
  }, []);

  const openListIndexToggle = (i: number) => {
    if (i === openListIndex) {
      setOpenListIndex(0);
    } else {
      setOpenListIndex(i);
    }
  };

  const styleAlert: React.CSSProperties = {
    position: "absolute",
    right: "1px",
    top: "1px",
    backgroundColor: "red",
    borderRadius: "9999px",
    width: "16px",
    height: "16px",
    fontSize: "12px",
    color: "white",
    textAlign: "center",
    lineHeight: "16px",
    fontWeight: "bold",
  };

  const topPage = () => {
    if (role === "Admin") {
      return "/admin";
    } else {
      return "/";
    }
  };

  return (
    <div id="pageTop">
      <header>
        <div id="header">
          <div className="cont">
            {/* adminでは出さない */}
            {/* {!isAdminPage() && (
              <p className="officeName">
                <select>
                  <option>A事業所</option>
                  <option>B事業所</option>
                  <option>C事業所</option>
                </select>
              </p>
            )} */}
            <nav className="head">
              <p
                onClick={barOpenToggle}
                className={`trigger ${barOpen ? "open" : ""}`}
              >
                <span></span>
                <span></span>
                <span></span>
              </p>
              <div className="logo">
                <Link href={topPage()}>
                  <Image
                    src="/img/logo.png"
                    alt="logo"
                    width={40}
                    height={40}
                  />
                </Link>
              </div>
              <ul className="top">
                {unreadNotificationCount > 0 && (
                  <li>
                    <Link href="/">
                      <FontAwesomeIcon icon={faBell} size="lg" />
                    </Link>
                    <span style={styleAlert}>{unreadNotificationCount}</span>
                  </li>
                )}
              </ul>
              <ul className="bottom">
                {/* <li>
                  <Link href="#">
                    <FontAwesomeIcon icon={faHeadset} />
                    <span className="alert"></span>
                  </Link>
                </li> */}
                <li>
                  <Link
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      signOut();
                    }}
                  >
                    <FontAwesomeIcon icon={faSignOutAlt} />
                  </Link>
                </li>
              </ul>
            </nav>
            <nav className={`side ${barOpen ? "open" : ""}`}>
              <CategoryNavigation
                category={isAdminPage() ? "admin" : category || "default"}
                role={role || ""}
                openListIndex={openListIndex}
                onToggle={openListIndexToggle}
              />
            </nav>
          </div>
        </div>
      </header>
    </div>
  );
}
