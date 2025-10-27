/**
 * @fileoverview Centralized UI component barrel exports
 * @description Enables cleaner imports: import { Button, Card } from '@/ui'
 */

// Buttons and inputs
export { Button } from "./button";
export { Input } from "./input";

// Cards and containers
export {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./card";

// Tables
export {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./table";

// Dialogs and modals
export {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./dialog";

// Loading and skeleton
export { Loading, TableLoading, SkeletonCard, SkeletonTable } from "./loading";

// Other components
export {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";

export { Textarea } from "./textarea";
export { Switch } from "./switch";
export { Slider } from "./slider";
export { Separator } from "./separator";
export { ScrollArea } from "./scroll-area";
export { Label } from "./label";
export { Skeleton } from "./skeleton";
export { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";
export {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./tooltip";
export { Popover, PopoverContent, PopoverTrigger } from "./popover";
export { Progress } from "./progress";
export {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";
export {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./sheet";

// Utilities
export { cn } from "@/lib/utils";
