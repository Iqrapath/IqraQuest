import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { Toaster as Sonner, ToasterProps } from "sonner"
const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      richColors
      closeButton
      className="toaster group font-['Nunito']"
      icons={{
        success: <CircleCheckIcon className="w-5 h-5" />,
        info: <InfoIcon className="w-5 h-5" />,
        warning: <TriangleAlertIcon className="w-5 h-5" />,
        error: <OctagonXIcon className="w-5 h-5" />,
        loading: <Loader2Icon className="w-5 h-5 animate-spin" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-zinc-950 group-[.toaster]:border-zinc-200 group-[.toaster]:shadow-xl group-[.toaster]:rounded-2xl group-[.toaster]:p-4",
          description: "group-[.toast]:text-zinc-500 text-sm font-medium",
          title: "group-[.toast]:text-zinc-800 text-base font-bold",
          actionButton:
            "group-[.toast]:bg-[#338078] group-[.toast]:text-white group-[.toast]:font-semibold group-[.toast]:rounded-lg",
          cancelButton:
            "group-[.toast]:bg-zinc-100 group-[.toast]:text-zinc-500 group-[.toast]:font-medium group-[.toast]:rounded-lg",
          closeButton: "group-[.toast]:bg-zinc-100 group-[.toast]:text-zinc-500 hover:group-[.toast]:bg-zinc-200",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
