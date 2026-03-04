import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const loggedIn = req.cookies.get("loggedIn")?.value;
  const pathname = req.nextUrl.pathname;
  // 1. ログインページ処理
  if (pathname === "/login") {
    // セッションがある場合ではダッシュボードへ
    if (loggedIn) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  }

  // インストールページ（未ログインでもアクセス可）
  if (pathname === "/install") {
    return NextResponse.next();
  }

  // 2. 管理者ログインページ処理
  if (pathname === "/admin/login") {
    // 2. セッションがある場合ではadminダッシュボードへ
    if (loggedIn) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
    return NextResponse.next();
  }

  // 3. ユーザーログインページ処理
  if (pathname === "/users/login") {
    // セッションがある場合ではダッシュボードへ
    if (loggedIn) {
      return NextResponse.redirect(new URL("/users", req.url));
    }
    return NextResponse.next();
  }

  // 4. 未ログインの場合
  if (!loggedIn) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // 4. 正常
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
