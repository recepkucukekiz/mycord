import React from "react";
import { AUTH_KEY } from "@/constants";
import { cookies } from "next/headers";
import { defaultLocale, redirect } from "@/app/navigation";

const withAuth = (Component: React.FC<any>) => {
  const Auth = async (props: any) => {
    const cookiesApi = await cookies();
    const locale = cookiesApi.get("NEXT_LOCALE")?.value || defaultLocale;
    const authKey = cookiesApi.get(AUTH_KEY)?.value;

    if (!authKey) {
      redirect({
        href: "/auth",
        locale,
      });
    }

    return <Component {...props} />;
  };

  return Auth;
};

export default withAuth;
