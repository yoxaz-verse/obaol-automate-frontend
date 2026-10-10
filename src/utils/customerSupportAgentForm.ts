export type CustomerSupportAgentForm = {
  name: string;
  email: string;
  phone: string;
  password: string;
  isActive: boolean;
};

export type CustomerSupportAgentFormErrors = Partial<Record<"name" | "email" | "password", string>>;

const emailPattern = /^\S+@\S+\.\S+$/;

export const validateCustomerSupportAgentForm = (
  form: CustomerSupportAgentForm,
  isEditing: boolean
): CustomerSupportAgentFormErrors => {
  const errors: CustomerSupportAgentFormErrors = {};
  if (!form.name.trim()) errors.name = "Name is required.";
  if (!emailPattern.test(form.email.trim())) errors.email = "Enter a valid email address.";
  if (!isEditing && !form.password) errors.password = "Temporary password is required.";
  else if (form.password && form.password.length < 8) errors.password = "Password must contain at least 8 characters.";
  return errors;
};
