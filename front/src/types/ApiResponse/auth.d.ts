type AuthResponse = {
  messages: string[];
  office_category: string;
  user: User;
  role: "Admin" | "StaffAdmin" | "Staff";
};

export default SuccessResponse;
