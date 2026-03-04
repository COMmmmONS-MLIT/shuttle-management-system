import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import {
  faCalendarCheck,
  faDatabase,
  faBuilding,
} from "@fortawesome/free-solid-svg-icons";

export type NavigationItem = {
  label: string;
  href: string;
};

export type NavigationGroup = {
  id: number;
  className: string;
  icon: IconDefinition;
  label: string;
  items: NavigationItem[];
  showCondition?: (role: string) => boolean;
  /** true のときアコーディオンではなく単一リンクとして表示 */
  asDirectLink?: boolean;
};

export type LayoutMapping = {
  pathPattern: string;
  layoutType: string;
};

export type CategoryConfig = {
  name: string;
  navigationGroups: NavigationGroup[];
  layoutMappings: LayoutMapping[];
};

const createTodayLink = (base: string) => `${base}?date={{today}}`;

export const categoryConfigs: Record<string, CategoryConfig> = {
  admin: {
    name: "admin",
    navigationGroups: [
      {
        id: 1,
        className: "plan",
        icon: faBuilding,
        label: "事業所一覧",
        items: [{ label: "事業所一覧", href: "/admin" }],
        asDirectLink: true,
      },
      {
        id: 2,
        className: "master",
        icon: faDatabase,
        label: "管理者アカウント\n管理",
        items: [
          { label: "アカウント登録", href: "/admin/admins/new" },
          { label: "アカウント一覧", href: "/admin/admins" },
        ],
      },
    ],
    layoutMappings: [
      { pathPattern: "/admin/login", layoutType: "admin-login" },
      { pathPattern: "/admin", layoutType: "admin" },
    ],
  },
  tourism: {
    name: "tourism",
    navigationGroups: [
      {
        id: 1,
        className: "plan",
        icon: faCalendarCheck,
        label: "送迎計画",
        items: [
          {
            label: "送迎一覧",
            href: createTodayLink("/soge"),
          },
          {
            label: "送迎一覧(委託)",
            href: createTodayLink("/soge/requested"),
          },
        ],
      },
      {
        id: 2,
        className: "master",
        icon: faDatabase,
        label: "マスタ管理",
        items: [
          { label: "職員登録", href: "/staffs/new" },
          { label: "職員一覧", href: "/staffs" },
          { label: "車両登録", href: "/cars/new" },
          { label: "車両一覧", href: "/cars" },
          { label: "地点登録", href: "/points/new" },
          { label: "地点一覧", href: "/points" },
        ],
        showCondition: (role: string) =>
          role === "Admin" || role === "StaffAdmin",
      },
    ],
    layoutMappings: [
      { pathPattern: "/soge/print", layoutType: "print" },
      { pathPattern: "/soge/print_requested", layoutType: "print" },
      { pathPattern: "/map", layoutType: "map" },
      { pathPattern: "/visiting", layoutType: "plan" },
      { pathPattern: "/soge", layoutType: "plan" },
      { pathPattern: "/customer_ngs", layoutType: "master" },
      { pathPattern: "*", layoutType: "master" },
    ],
  },
  education: {
    name: "education",
    navigationGroups: [
      {
        id: 1,
        className: "plan",
        icon: faCalendarCheck,
        label: "送迎計画",
        items: [
          {
            label: "送迎予約一覧",
            href: createTodayLink("/visiting"),
          },
          {
            label: "送迎一覧",
            href: createTodayLink("/soge"),
          },
          {
            label: "送迎一覧(委託)",
            href: createTodayLink("/soge/requested"),
          },
        ],
      },
      {
        id: 2,
        className: "master",
        icon: faDatabase,
        label: "マスタ管理",
        items: [
          { label: "利用者登録", href: "/customers/new" },
          { label: "利用者一覧", href: "/customers" },
          { label: "職員登録", href: "/staffs/new" },
          { label: "職員一覧", href: "/staffs" },
          { label: "車両登録", href: "/cars/new" },
          { label: "車両一覧", href: "/cars" },
          { label: "地点登録", href: "/points/new" },
          { label: "地点一覧", href: "/points" },
        ],
        showCondition: (role: string) =>
          role === "Admin" || role === "StaffAdmin",
      },
    ],
    layoutMappings: [
      { pathPattern: "/soge/print", layoutType: "print" },
      { pathPattern: "/soge/print_requested", layoutType: "print" },
      { pathPattern: "/map", layoutType: "map" },
      { pathPattern: "/visiting", layoutType: "plan" },
      { pathPattern: "/soge", layoutType: "plan" },
      { pathPattern: "/customer_ngs", layoutType: "master" },
      { pathPattern: "*", layoutType: "master" },
    ],
  },

  default: {
    name: "default",
    navigationGroups: [
      {
        id: 1,
        className: "plan",
        icon: faCalendarCheck,
        label: "送迎計画",
        items: [
          {
            label: "来館一覧",
            href: createTodayLink("/visiting"),
          },
          {
            label: "送迎一覧",
            href: createTodayLink("/soge"),
          },
          {
            label: "送迎一覧(委託)",
            href: createTodayLink("/soge/requested"),
          },
        ],
      },
      {
        id: 2,
        className: "master",
        icon: faDatabase,
        label: "マスタ管理",
        items: [
          { label: "利用者登録", href: "/customers/new" },
          { label: "利用者一覧", href: "/customers" },
          { label: "職員登録", href: "/staffs/new" },
          { label: "職員一覧", href: "/staffs" },
          { label: "車両登録", href: "/cars/new" },
          { label: "車両一覧", href: "/cars" },
          { label: "地点登録", href: "/points/new" },
          { label: "地点一覧", href: "/points" },
          { label: "乗り合わせ設定", href: "/customer_ngs" },
        ],
        showCondition: (role: string) =>
          role === "Admin" || role === "StaffAdmin",
      },
    ],
    layoutMappings: [
      { pathPattern: "/admin/login", layoutType: "admin-login" },
      { pathPattern: "/install", layoutType: "admin-login" },
      { pathPattern: "/admin", layoutType: "admin" },
      { pathPattern: "/login", layoutType: "login" },
      { pathPattern: "/users/login", layoutType: "users-login" },
      { pathPattern: "/soge/print", layoutType: "print" },
      { pathPattern: "/soge/print_requested", layoutType: "print" },
      { pathPattern: "/map", layoutType: "map" },
      { pathPattern: "/visiting", layoutType: "plan" },
      { pathPattern: "/soge", layoutType: "plan" },
      { pathPattern: "/customer_ngs", layoutType: "master" },
      { pathPattern: "/users", layoutType: "users" },
      { pathPattern: "*", layoutType: "master" },
    ],
  },
};

export const getCategoryConfig = (category: string): CategoryConfig => {
  return categoryConfigs[category] || categoryConfigs.default;
};

export const getLayoutType = (pathname: string, category: string): string => {
  const config = getCategoryConfig(category);

  for (const mapping of config.layoutMappings) {
    if (mapping.pathPattern === "*") {
      return mapping.layoutType;
    }

    if (pathname.startsWith(mapping.pathPattern)) {
      return mapping.layoutType;
    }
  }

  return "master";
};
