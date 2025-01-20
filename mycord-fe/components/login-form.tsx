"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useLoginMutation } from "@/store/services/authService";
import { useState } from "react";
import { setCookie } from "cookies-next";
import { AUTH_KEY } from "@/constants";
import { useToast } from "@/hooks/use-toast";
import { useAppDispatch } from "@/store/hooks";
import { setAuthTokens } from "@/store/state";
import { useRouter } from "@/app/navigation";

export function LoginForm({
  formTypeChanger,
}: {
  formTypeChanger: () => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [login, { isLoading: loginLoading }] = useLoginMutation();
  const { toast } = useToast();
  const router = useRouter();
  const dispatch = useAppDispatch();

  const handleLogin = async () => {
    try {
      const data = await login({ email, password }).unwrap();

      if (data) {
        setCookie(AUTH_KEY, data.token);
        dispatch(setAuthTokens({ token: data.token }));
        toast({
          title: "Success",
          description: "Login successful",
        });
        router.push("/app");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to login " + error?.data?.message,
      });
    }
  };

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>
          Enter your email below to login to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center">
              <Label htmlFor="password">Password</Label>
              {/* <Link href="#" className="ml-auto inline-block text-sm underline">
                Forgot your password?
              </Link> */}
            </div>
            <Input
              id="password"
              type="password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button
            variant={"gooeyLeft"}
            isLoading={loginLoading}
            onClick={handleLogin}
            type="submit"
            className="w-full">
            Login
          </Button>
        </div>
        <div className="mt-4 text-center text-sm">
          Don&apos;t have an account?{" "}
          <Button
            variant={"link"}
            onClick={formTypeChanger}
            className="underline px-0">
            Sign up
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
