export const getSectionClasses = (isDark: boolean): string =>
  `space-y-2 rounded-lg border p-3 ${
    isDark ? "border-slate-700 bg-slate-800/50" : "border-slate-200 bg-slate-50"
  }`;

export const labelClasses =
  "ml-1 flex items-center text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400";

export const getInputClasses = (isDark: boolean): string =>
  `min-h-[44px] w-full rounded-lg border p-3 text-xs outline-none transition-colors duration-150 ${
    isDark
      ? "border-slate-700 bg-slate-900 text-white placeholder:text-slate-500 focus:border-indigo-500"
      : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-indigo-500"
  }`;

export const getSelectClasses = (isDark: boolean): string =>
  `min-h-[44px] w-full appearance-none rounded-lg border p-3 text-xs font-medium outline-none transition-colors duration-150 ${
    isDark
      ? "border-slate-700 bg-slate-900 text-white focus:border-indigo-500"
      : "border-slate-200 bg-white text-slate-900 shadow-sm focus:border-indigo-500"
  }`;

export const getToggleButtonClasses = (isActive: boolean, isDark: boolean): string =>
  `relative h-6 w-11 rounded-full transition-colors duration-150 ${
    isActive ? "bg-indigo-500" : isDark ? "bg-slate-600" : "bg-slate-300"
  }`;

export const getToggleKnobClasses = (isActive: boolean): string =>
  `absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all duration-150 ${
    isActive ? "ltr:left-[22px] rtl:right-[22px]" : "ltr:left-0.5 rtl:right-0.5"
  }`;
