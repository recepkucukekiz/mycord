"use client";

import { useToast } from "@/hooks/use-toast";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useState } from "react";
import { useAddBugMutation } from "@/store/services/appService";
import { Label } from "./ui/label";

export default function AddBug() {
  const { toast } = useToast();
  const [bug, setBug] = useState("");
  const [addBug, { isLoading }] = useAddBugMutation();

  const handleAddBug = async () => {
    if (!bug || isLoading) {
      return;
    }

    try {
      await addBug({ bug }).unwrap();
      setBug("");
      toast({
        title: "Bug Added",
        description: "We will fix it soon: " + bug,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add bug",
      });
    }
  };

  return (
    <div className="flex w-full items-center justify-between gap-2">
      <span className="font-extrabold text-xl mr-auto">BUGS</span>
      <Input
        className="max-w-64"
        placeholder="Type what is going bad?"
        value={bug}
        onChange={(e) => {
          setBug(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleAddBug();
          }
        }}
      />
      <Button isLoading={isLoading} variant="outline" onClick={handleAddBug}>
        Add Bug
      </Button>
    </div>
  );
}
