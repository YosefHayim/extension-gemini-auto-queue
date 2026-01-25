export const getSectionClasses = (): string =>
  `space-y-2 rounded-lg border p-3 border-border bg-muted`;

export const labelClasses =
  "ml-1 flex items-center text-xs font-semibold uppercase tracking-wide text-muted-foreground";

export const getInputClasses = (): string =>
  `min-h-[44px] w-full rounded-lg border p-3 text-xs outline-none transition-colors duration-150 border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-primary`;

export const getSelectClasses = (): string =>
  `min-h-[44px] w-full appearance-none rounded-lg border p-3 text-xs font-medium outline-none transition-colors duration-150 border-border bg-background text-foreground shadow-sm focus:border-primary`;

export const getToggleButtonClasses = (isActive: boolean): string =>
  `relative h-6 w-11 rounded-full transition-colors duration-150 ${
    isActive ? "bg-primary" : "bg-muted-foreground"
  }`;

export const getToggleKnobClasses = (isActive: boolean): string =>
  `absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all duration-150 ${
    isActive ? "ltr:left-[22px] rtl:right-[22px]" : "ltr:left-0.5 rtl:right-0.5"
  }`;
