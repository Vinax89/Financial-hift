/**
 * Script to fix unused variable errors by prefixing with underscore
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Map of files and their unused variables
const unusedVars = {
  "paycheck/PaycheckBreakdown.tsx": [
    {
      old: "// @ts-ignore\n  const Loading = ",
      new: "// @ts-expect-error\n  const _Loading = ",
    },
    {
      old: "import React from 'react';",
      new: "import React, { type JSX } from 'react';",
    },
  ],
  "shared/ErrorBoundary.tsx": [
    {
      old: "import React from 'react';",
      new: "import React, { type JSX } from 'react';",
    },
  ],
  "shared/ErrorMessage.tsx": [
    {
      old: "import React from 'react';",
      new: "import React, { type JSX } from 'react';",
    },
  ],
  "shared/NotificationsCenter.tsx": [
    { old: "import React", new: "import React, { type JSX }" },
  ],
  "shift-rules/ShiftRuleList.tsx": [
    { old: "import { Card,", new: "import {" },
    { old: ", Card,", new: "," },
  ],
  "shift-rules/ShiftRulePreview.tsx": [
    { old: "import { Card,", new: "import {" },
    { old: ", Card,", new: "," },
    { old: ", ShieldAlert", new: "" },
  ],
  "shifts/ShiftCalendar.jsx": [
    { old: ", Clock, MapPin", new: "" },
    { old: "  const formatCurrency =", new: "  const _formatCurrency =" },
  ],
  "shifts/ShiftForm.jsx": [{ old: "import React from 'react';", new: "" }],
  "shifts/ShiftForm.tsx": [{ old: "import React from 'react';", new: "" }],
  "shifts/ShiftImport.jsx": [{ old: "} catch (e) {", new: "} catch (_e) {" }],
  "shifts/ShiftImport.tsx": [{ old: "} catch (e) {", new: "} catch (_e) {" }],
  "shifts/ShiftList.jsx": [
    { old: ", useMemo", new: "" },
    { old: ", formatDistance", new: "" },
  ],
  "shifts/ShiftStats.jsx": [{ old: ", isWithinInterval", new: "" }],
  "shifts/ShiftStats.tsx": [
    { old: "import { format,", new: "import {" },
    { old: ", format,", new: "," },
  ],
  "subscription/Paywall.tsx": [{ old: ": featureKey)", new: ": _featureKey)" }],
  "theme/ThemeProvider.jsx": [
    { old: ", useRef", new: "" },
    { old: "import { motion, AnimatePresence", new: "import {" },
    { old: ", motion, AnimatePresence", new: "" },
    { old: "  const { intensity,", new: "  const { intensity: _intensity," },
  ],
  "theme/ThemeToggle.jsx": [{ old: ", Monitor", new: "" }],
  "tools/income-viability/ViabilityCharts.jsx": [
    { old: "  const actualTheme =", new: "  const _actualTheme =" },
  ],
  "transactions/TransactionForm.tsx": [
    {
      old: "import { Card, CardContent, CardHeader, CardTitle,",
      new: "import {",
    },
    { old: ", Card, CardContent, CardHeader, CardTitle,", new: "," },
    { old: ", X", new: "" },
  ],
  "transactions/TransactionList.tsx": [{ old: ", useMemo", new: "" }],
  "types/lazyLoading.types.ts": [
    { old: ": React.FC<", new: ": import('react').FC<" },
    { old: ": React.ComponentType", new: ": import('react').ComponentType" },
  ],
  "types/performance.types.ts": [
    { old: "import { ComponentType, DependencyList,", new: "import {" },
    { old: ", ComponentType, DependencyList,", new: "," },
  ],
  "types/sentry.types.ts": [
    { old: "import * as Sentry from '@sentry/react';", new: "" },
  ],
  "types/virtualScroll.types.ts": [
    { old: ": React.ReactNode", new: ": import('react').ReactNode" },
  ],
  "ui/enhanced-components.tsx": [
    { old: ", CardContent, CardHeader, CardTitle", new: "" },
    { old: "import { Badge", new: "import {" },
    { old: ", Badge", new: "" },
    {
      old: "  const { isDark, isOled,",
      new: "  const { isDark: _isDark, isOled: _isOled,",
    },
  ],
  "ui/ErrorBoundary.tsx": [{ old: "(error: Error)", new: "(_error: Error)" }],
  "ui/theme-aware-animations.tsx": [
    { old: ", useRef, useEffect", new: "" },
    {
      old: ", intensity, disabled",
      new: ", intensity: _intensity, disabled: _disabled",
    },
    { old: "  const actualTheme =", new: "  const _actualTheme =" },
    { old: ", pulse", new: ", pulse: _pulse" },
    { old: ", speed", new: ", speed: _speed" },
    { old: ", strength", new: ", strength: _strength" },
    { old: "  const getBlurIntensity =", new: "  const _getBlurIntensity =" },
  ],
  "utils/calculations.ts": [
    { old: "import { format, parseISO,", new: "import {" },
    { old: ", format, parseISO,", new: "," },
  ],
  "utils/dateUtils.test.ts": [
    { old: "  formatDateTime,", new: "" },
    { old: "  formatTime,", new: "" },
  ],
  "utils/errorLogging.ts": [
    { old: "interface ErrorWithResponse", new: "interface _ErrorWithResponse" },
  ],
  "utils/lazyLoad.tsx": [
    { old: "import React, { ComponentProps,", new: "import React, {" },
    { old: ", ComponentProps,", new: "," },
  ],
  "utils/lazyLoading.tsx": [
    { old: ": JSX.Element", new: ": import('react').JSX.Element" },
    { old: ") => JSX", new: ") => import('react').JSX" },
  ],
  "utils/performance.test.ts": [{ old: ", waitFor", new: "" }],
  "utils/rateLimiter.test.ts": [
    { old: "    const promise2 =", new: "    const _promise2 =" },
  ],
  "utils/rateLimiter.ts": [
    { old: ": NodeJS.Timeout", new: ": ReturnType<typeof setTimeout>" },
  ],
  "utils/secureStorage.ts": [
    {
      old: "const ENCRYPTION_KEY_NAME = 'financial-hift-encryption-key';",
      new: "",
    },
    { old: "} catch (error) {", new: "} catch (_error) {" },
  ],
  "utils/sentry 2.ts": [
    { old: "import React from 'react';", new: "" },
    { old: ", hint: any", new: ", _hint: any" },
  ],
  "utils/sentry.js": [
    { old: "import React from 'react';", new: "" },
    { old: ", hint)", new: ", _hint)" },
  ],
  "utils/sentry.ts": [
    { old: "interface ErrorContext", new: "interface _ErrorContext" },
    { old: ", hint)", new: ", _hint)" },
  ],
  "utils/storageMigration.test.ts": [
    { old: "    const callCount =", new: "    const _callCount =" },
    { old: ", value)", new: ", _value)" },
  ],
  "utils/virtualScroll.tsx": [
    { old: ": NodeJS.Timeout", new: ": ReturnType<typeof setTimeout>" },
    { old: ": JSX.Element", new: ": import('react').JSX.Element" },
  ],
  "vite.config.js": [
    { old: "import { readFileSync", new: "import {" },
    { old: ", readFileSync", new: "" },
  ],
  "vitest.config.js": [
    { old: "import { storybookTest", new: "import {" },
    { old: ", storybookTest", new: "" },
    { old: "const dirname =", new: "const _dirname =" },
  ],
  "workers/calculations.worker.js": [
    { old: "(s)", new: "(_s)" },
    { old: "  const transactions =", new: "  const _transactions =" },
  ],
  "tests/components/FormComponents.test.jsx": [
    { old: ", vi, beforeEach", new: "" },
    { old: "    const checkbox =", new: "    const _checkbox =" },
  ],
  "tests/components/LoadingComponents.test.jsx": [{ old: ", vi", new: "" }],
  "tests/integration/ApiClient.test.jsx": [
    { old: "import { renderHook, waitFor", new: "import {" },
    { old: ", renderHook, waitFor", new: "" },
    { old: "import { QueryClient, QueryClientProvider", new: "import {" },
    { old: ", QueryClient, QueryClientProvider", new: "" },
    { old: "const useTransactions =", new: "const _useTransactions =" },
    { old: "} catch (error) {", new: "} catch (_error) {" },
  ],
  "tests/integration/FormFlow.test.jsx": [
    {
      old: "import { mockFetch, createMockTransaction, createMockBudget, createMockGoal",
      new: "import {",
    },
    {
      old: ", mockFetch, createMockTransaction, createMockBudget, createMockGoal",
      new: "",
    },
  ],
  "tests/integration/Hooks.test.jsx": [
    { old: "    const timeoutCount =", new: "    const _timeoutCount =" },
  ],
  "tests/schemas/formSchemas.test.js": [
    { old: "  subscriptionSchema,", new: "" },
  ],
  "utils/api.test.ts": [{ old: ", beforeEach", new: "" }],
};

function fixFile(filePath, fixes) {
  const fullPath = path.join(__dirname, "..", filePath);
  if (!fs.existsSync(fullPath)) {
    console.log(`Skipping ${filePath} - file not found`);
    return;
  }

  let content = fs.readFileSync(fullPath, "utf8");
  let changed = false;

  for (const fix of fixes) {
    if (content.includes(fix.old)) {
      content = content.replace(fix.old, fix.new);
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(fullPath, content);
    console.log(`✓ Fixed ${filePath}`);
  } else {
    console.log(`- No changes needed for ${filePath}`);
  }
}

console.log("=== Fixing unused variables and imports ===\n");

for (const [filePath, fixes] of Object.entries(unusedVars)) {
  fixFile(filePath, fixes);
}

console.log("\n=== Done! ===");
