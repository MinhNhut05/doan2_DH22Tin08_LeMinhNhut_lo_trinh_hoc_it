import { toast } from 'sonner';
import { vi } from '../strings/vi';

let offlineToastId: string | number | undefined;

export function initOfflineDetector() {
  window.addEventListener('offline', () => {
    offlineToastId = toast.warning(vi.common.offline, { duration: Infinity });
  });

  window.addEventListener('online', () => {
    if (offlineToastId !== undefined) {
      toast.dismiss(offlineToastId);
      offlineToastId = undefined;
    }
  });
}
