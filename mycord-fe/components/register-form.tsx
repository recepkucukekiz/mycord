import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useRegisterMutation } from "@/store/services/authService";
import { useState } from "react";

export function RegisterForm({
  formTypeChanger,
}: {
  formTypeChanger: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [avatar, setAvatar] = useState("https://github.com/recepkucukekiz.png");

  const [register, { isLoading: registerLoading }] = useRegisterMutation();
  const { toast } = useToast();

  const handleRegister = async () => {
    try {
      const data = await register({ name, email, password, avatar }).unwrap();

      if (data) {
        toast({
          title: "Success",
          description: "Register successful",
        });
        formTypeChanger();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to register " + error?.data?.message,
      });
    }
  };
  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Register</CardTitle>
        <CardDescription>
          Enter your details below to create an account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              type="text"
              placeholder="Recep"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
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
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div><div className="grid gap-2">
            <Label htmlFor="avatar">Name</Label>
            <Input
              id="avatar"
              type="text"
              placeholder="https://github.com/recepkucukekiz.png"
              value={avatar}
              onChange={(e) => setAvatar(e.target.value)}
              required
            />
          </div>
          <Button
            onClick={handleRegister}
            isLoading={registerLoading}
            type="submit"
            className="w-full">
            Register
          </Button>
        </div>
        <div className="mt-4 text-center text-sm">
          Already have an account?{" "}
          <Button
            variant={"link"}
            onClick={formTypeChanger}
            className="underline px-0">
            Sign in
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
