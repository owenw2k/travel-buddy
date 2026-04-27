"use client";

/**
 * Dialog shown when the user opens a share URL containing encoded map state.
 *
 * Reads the `s` query parameter on mount and, if it decodes to a valid MapState,
 * prompts the user to import or dismiss. This component must be wrapped in a
 * React Suspense boundary because it calls useSearchParams().
 */

import { useSearchParams } from "next/navigation";
import { useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { decodeState } from "@/lib/share";
import { useMapStore } from "@/store/mapStore";

import type { ReactElement } from "react";

/**
 * Reads the `s` query parameter and shows an import confirmation dialog when
 * a valid encoded MapState is present. Returns null if the param is absent,
 * invalid, or the user has already dismissed the dialog.
 *
 * @returns An AlertDialog prompting the user to import or keep their map, or null.
 */
export const ShareImportDialog = (): ReactElement | null => {
  const searchParams = useSearchParams();
  const encoded = searchParams.get("s");
  const sharedState = encoded ? decodeState(encoded) : null;

  const [dismissed, setDismissed] = useState(false);
  const { importState } = useMapStore();

  if (!sharedState || dismissed) {
    return null;
  }

  const handleImport = (): void => {
    importState(sharedState);
    setDismissed(true);
  };

  const handleDismiss = (): void => {
    setDismissed(true);
  };

  return (
    <AlertDialog open>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Import shared map?</AlertDialogTitle>
          <AlertDialogDescription>
            This will replace your current map data with the shared snapshot. This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleDismiss}>Keep my map</AlertDialogCancel>
          <AlertDialogAction onClick={handleImport}>Import map</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
