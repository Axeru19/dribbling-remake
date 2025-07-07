"use client";

import React from "react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Pathname() {
  let pathname = usePathname(); // Remove the first empty segment if it exists

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {pathname
          .split("/") // Filter out empty segments
          .map((segment, index) => {
            if (segment == "") return;
            const isLast = index === pathname.split("/").length - 1;
            const href = `/${pathname
              .split("/")
              .slice(1, index + 1)
              .join("/")}`;

            return (
              <React.Fragment key={href}>
                <BreadcrumbItem key={index}>
                  <BreadcrumbPage className="capitalize">
                    <Link
                      className={isLast ? "font-semibold" : "text-gray-500"}
                      href={href}
                    >
                      {segment}
                    </Link>
                  </BreadcrumbPage>
                </BreadcrumbItem>
                {!isLast && <BreadcrumbSeparator key={href} />}
              </React.Fragment>
            );
          })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
