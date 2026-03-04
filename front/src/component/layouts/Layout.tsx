import { ReactElement } from "react";
import SideBar from "./Sidebar";
import Footer from "./Footer";
// context
import { useUser } from "@/contexts/UserContext";

type Props = {
  children: ReactElement;
  type?: string;
};

export default function Layout({ children, type = "" }: Props) {
  const { user } = useUser();
  return (
    <main id="container">
      {user?.id ? (
        <>
          <SideBar />

          <div id="pageBody">{children}</div>

          <Footer />
        </>
      ) : null}
    </main>
  );
}
