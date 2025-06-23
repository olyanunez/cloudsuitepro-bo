"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface StepProps {
  title: string;
  description?: string;
  isActive?: boolean;
  isCompleted?: boolean;
  isLast?: boolean;
}

export const Step = ({
  title,
  description,
  isActive = false,
  isCompleted = false,
  isLast = false,
}: StepProps) => {
  return (
    <div className="flex items-start">
      <div className="flex flex-col items-center">
        <div
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-full border-2",
            isActive
              ? "border-primary bg-primary text-primary-foreground"
              : isCompleted
              ? "border-primary bg-primary text-primary-foreground"
              : "border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400"
          )}
        >
          {isCompleted ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-check"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <span className="text-sm font-medium">{isActive ? "✓" : "○"}</span>
          )}
        </div>
        {!isLast && (
          <div
            className={cn(
              "h-12 w-0.5 my-1",
              isCompleted
                ? "bg-primary"
                : "bg-gray-300 dark:bg-gray-600"
            )}
          />
        )}
      </div>
      <div className="ml-4 mt-0.5">
        <h3
          className={cn(
            "text-sm font-medium",
            isActive || isCompleted
              ? "text-gray-900 dark:text-white"
              : "text-gray-500 dark:text-gray-400"
          )}
        >
          {title}
        </h3>
        {description && (
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {description}
          </p>
        )}
      </div>
    </div>
  );
};

export interface StepperProps {
  steps: Array<{
    title: string;
    description?: string;
  }>;
  currentStep: number;
  className?: string;
}

export const Stepper = ({
  steps,
  currentStep,
  className,
}: StepperProps) => {
  return (
    <div className={cn("flex flex-col space-y-4", className)}>
      {steps.map((step, index) => (
        <Step
          key={index}
          title={step.title}
          description={step.description}
          isActive={index === currentStep}
          isCompleted={index < currentStep}
          isLast={index === steps.length - 1}
        />
      ))}
    </div>
  );
};
