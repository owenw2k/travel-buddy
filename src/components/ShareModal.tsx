"use client";

/**
 * Share button and dialog for generating a shareable snapshot URL.
 */

import { Bird, Check, Link2, Share2 } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { encodeState, isShareUrlTooLong } from "@/lib/share";
import { useMapStore } from "@/store/mapStore";

import type { ReactElement } from "react";

/**
 * A ghost icon button that opens a share dialog with Twitter and copy-link options.
 *
 * The share URL encodes the current MapState as URL-safe base64 in the `s` query
 * parameter. If the encoded state exceeds the URL length limit, both share options
 * are replaced with a friendly "too long" message.
 *
 * @returns A dialog-triggering button rendered as a Share2 icon.
 */
export const ShareModal = (): ReactElement => {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { world, legends, regions } = useMapStore();

  const encoded = encodeState({ world, legends, regions });
  const tooLong = isShareUrlTooLong(encoded);

  /** Builds the share URL at call-time so window is only accessed client-side. */
  const buildShareUrl = (): string => `${window.location.origin}/?s=${encoded}`;

  const handleCopy = async (): Promise<void> => {
    await navigator.clipboard.writeText(buildShareUrl());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTwitter = (): void => {
    const url = buildShareUrl();
    const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent("Check out my travel map!")}&url=${encodeURIComponent(url)}`;
    window.open(tweetUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground"
        aria-label="Share map"
        onClick={() => setOpen(true)}
      >
        <Share2 className="h-4 w-4" aria-hidden="true" />
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Share your map</DialogTitle>
            <DialogDescription>
              {tooLong
                ? "Your map has too many notes to share as a URL. Try removing some notes and sharing again."
                : "Anyone with this link can view a snapshot of your current map."}
            </DialogDescription>
          </DialogHeader>
          {!tooLong && (
            <div className="flex flex-col gap-3">
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={handleTwitter}
              >
                <Bird className="h-4 w-4" aria-hidden="true" />
                Share on Twitter
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2" onClick={handleCopy}>
                {copied ? (
                  <Check className="h-4 w-4 text-green-600" aria-hidden="true" />
                ) : (
                  <Link2 className="h-4 w-4" aria-hidden="true" />
                )}
                {copied ? "Copied!" : "Copy link"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
