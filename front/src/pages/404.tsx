import Link from "next/link";

const NotFoundPage = () => {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#f5f5f5",
        gap: "1.5rem",
      }}
    >
      <h1 style={{ fontSize: "5rem", margin: 0, color: "#333" }}>404</h1>
      <p style={{ fontSize: "1.25rem", color: "#666", margin: 0 }}>
        ページが見つかりませんでした
      </p>
      <Link
        href="/login"
        style={{
          marginTop: "1rem",
          padding: "0.75rem 2rem",
          backgroundColor: "#3498db",
          color: "#fff",
          textDecoration: "none",
          borderRadius: "4px",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          fontSize: "1rem",
          transition: "background-color 0.2s",
        }}
      >
        ログインページに戻る
      </Link>
    </div>
  );
};

export default NotFoundPage;
