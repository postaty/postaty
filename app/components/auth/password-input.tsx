"use client";

import { useState } from "react";
import * as Clerk from "@clerk/elements/common";
import { Eye, EyeOff } from "lucide-react";

const inputClassName =
  "px-4 py-2.5 bg-surface-1 border border-card-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 w-full ltr:pr-10 rtl:pl-10";

export function PasswordInput() {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <Clerk.Input
        type={show ? "text" : "password"}
        className={inputClassName}
        placeholder="••••••••"
      />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        className="absolute top-1/2 -translate-y-1/2 ltr:right-3 rtl:left-3 text-muted-foreground hover:text-foreground transition-colors"
        tabIndex={-1}
      >
        {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
      </button>
    </div>
  );
}
