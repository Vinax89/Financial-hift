import { Toaster as SonnerToaster } from "@/ui/sonner";
import { ComponentProps } from "react";

type ToasterProps = ComponentProps<typeof SonnerToaster>;

const Toaster = (props: ToasterProps) => {
  return <SonnerToaster {...props} />;
};

export { Toaster };
export default Toaster;
