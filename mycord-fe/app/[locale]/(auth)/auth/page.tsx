"use client";

import { LoginForm } from "@/components/login-form";
import { RegisterForm } from "@/components/register-form";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";

enum FormTypes {
  LOGIN,
  REGISTER,
}

export default function AuthPage() {
  const [currentForm, setCurrentForm] = useState<FormTypes>(FormTypes.LOGIN);
  const router = useRouter();
  const accessToken = useAppSelector((state) => state.app.accessToken);

  useEffect(() => {
    if (accessToken) {
      router.push("/app");
    }
  }, [accessToken]);

  const toggleFormType = () => {
    setCurrentForm((prev) =>
      prev === FormTypes.LOGIN ? FormTypes.REGISTER : FormTypes.LOGIN
    );
  };

  return currentForm === FormTypes.LOGIN ? (
    <LoginForm formTypeChanger={toggleFormType} />
  ) : (
    <RegisterForm formTypeChanger={toggleFormType} />
  );
}
