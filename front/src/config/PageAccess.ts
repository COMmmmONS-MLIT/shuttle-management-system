// ページアクセス制御の設定ファイル

export type AccessRule = {
  path: string;
  allowedRoles: string[];
  allowedCategories?: string[];
};

export const pageAccessRules: AccessRule[] = [
  {
    path: "/",
    allowedRoles: ["Admin", "StaffAdmin", "Staff"],
  },
  {
    path: "/visiting",
    allowedRoles: ["Admin", "StaffAdmin", "Staff"],
    allowedCategories: ["welfare", "education"],
  },
  {
    path: "/soge/print",
    allowedRoles: ["Admin", "StaffAdmin", "Staff"],
  },
  {
    path: "/soge/print_requested",
    allowedRoles: ["Admin", "StaffAdmin", "Staff"],
  },
  {
    path: "/soge",
    allowedRoles: ["Admin", "StaffAdmin", "Staff"],
  },
  {
    path: "/soge/[id]",
    allowedRoles: ["Admin", "StaffAdmin", "Staff"],
  },
  {
    path: "/customers",
    allowedRoles: ["Admin", "StaffAdmin"],
    allowedCategories: ["welfare", "education"],
  },
  {
    path: "/customers/new",
    allowedRoles: ["Admin", "StaffAdmin"],
    allowedCategories: ["welfare", "education"],
  },
  {
    path: "/customers/[id]/edit",
    allowedRoles: ["Admin", "StaffAdmin"],
    allowedCategories: ["welfare", "education"],
  },
  {
    path: "/staffs",
    allowedRoles: ["Admin", "StaffAdmin"],
  },
  {
    path: "/staffs/new",
    allowedRoles: ["Admin", "StaffAdmin"],
  },
  {
    path: "/staffs/[id]/edit",
    allowedRoles: ["Admin", "StaffAdmin"],
  },
  {
    path: "/cars",
    allowedRoles: ["Admin", "StaffAdmin"],
  },
  {
    path: "/cars/new",
    allowedRoles: ["Admin", "StaffAdmin"],
  },
  {
    path: "/cars/[id]/edit",
    allowedRoles: ["Admin", "StaffAdmin"],
  },
  {
    path: "/points",
    allowedRoles: ["Admin", "StaffAdmin"],
  },
  {
    path: "/points/new",
    allowedRoles: ["Admin", "StaffAdmin"],
  },
  {
    path: "/points/[id]/edit",
    allowedRoles: ["Admin", "StaffAdmin"],
  },
  {
    path: "/customer_ngs",
    allowedRoles: ["Admin", "StaffAdmin"],
    allowedCategories: ["welfare", "education"],
  },
  {
    path: "/users",
    allowedRoles: ["Customer"],
  },
];

export const checkPageAccess = (
  userRole: string,
  currentPath: string,
  userCategory?: string
): { allowed: boolean; redirectTo: string } => {
  if (currentPath === "/login" || currentPath === "/admin/login" || currentPath === "/users/login" || currentPath === "/install") {
    return { allowed: true, redirectTo: currentPath };
  }

  const cleanPath = currentPath.split("?")[0];
  const matchedRule = pageAccessRules.find((rule) => rule.path === cleanPath);

  if (!matchedRule) {
    return { allowed: true, redirectTo: currentPath };
  }

  const roleAllowed = matchedRule.allowedRoles.includes(userRole);
  const categoryAllowed = !matchedRule.allowedCategories || 
    matchedRule.allowedCategories.includes(userCategory || "welfare");
  const allowed = roleAllowed && categoryAllowed;

  return {
    allowed,
    redirectTo: allowed ? currentPath : userRole === "Customer" ? "/users" : "/",
  };
};
