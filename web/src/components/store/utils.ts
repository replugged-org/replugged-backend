import install from "../../install";
import { toast } from "react-hot-toast";

const toastIdMap = new Map<string, string>();

export function installAddon(identifier: string): Promise<void> {
  if (toastIdMap.has(identifier)) {
    // Dismiss any existing toasts for the same addon
    toast.dismiss(toastIdMap.get(identifier)!);
  }

  const toastId = toast.loading("Connecting...");
  toastIdMap.set(identifier, toastId);

  let lastToast = Date.now();
  let state: "connecting" | "installing" | "done" = "connecting";

  return new Promise((resolve) => {
    install({
      data: {
        identifier,
      },
      onConnect: () => {
        state = "installing";
        const waitToToast = Math.max(0, 500 - (Date.now() - lastToast));
        setTimeout(() => {
          if (state !== "installing") return;
          toast.loading(
            "Connected to Replugged, please confirm the addon installation in Discord.",
            {
              id: toastId,
            },
          );
          lastToast = Date.now();
        }, waitToToast);
      },
      onFinish: (res) => {
        state = "done";
        const waitToToast = Math.max(0, 500 - (Date.now() - lastToast));

        setTimeout(() => {
          switch (res.kind) {
            case "SUCCESS":
              toast.success(`${res.manifest.name} was successfully installed.`, {
                id: toastId,
              });
              break;
            case "ALREADY_INSTALLED":
              toast.error(`${res.manifest.name} is already installed.`, {
                id: toastId,
              });
              break;
            case "FAILED":
              toast.error("Failed to get addon info.", {
                id: toastId,
              });
              break;
            case "CANCELLED":
              toast.error("Installation cancelled.", {
                id: toastId,
              });
              break;
            case "UNREACHABLE":
              toast.error(
                "Could not connect to Replugged, please make sure Discord is open with the latest version of Replugged installed and try again.",
                {
                  id: toastId,
                },
              );
              break;
          }

          resolve();
        }, waitToToast);
      },
    });
  });
}
