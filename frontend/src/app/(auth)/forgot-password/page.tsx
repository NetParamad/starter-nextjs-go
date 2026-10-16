import { AuthFormShell } from "@/features/auth/components/auth-form-shell";

export default function ForgotPasswordPage() {
  return (
    <AuthFormShell
      mode="forgot-password"
      title="Reset password"
      description="Enter your account email and we will send instructions to create a new password."
      submitLabel="Send email"
      footerText="Remember your password?"
      footerLinkLabel="Login"
      footerLinkHref="/login"
      fields={[
        {
          id: "email",
          label: "Email",
          type: "email",
          placeholder: "Enter your email",
        },
      ]}
    />
  );
}
