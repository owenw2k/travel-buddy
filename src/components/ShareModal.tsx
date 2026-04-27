"use client";

/**
 * Share button and dialog for sharing a map snapshot to social platforms.
 */

import {
  SiBluesky,
  SiBlueskyHex,
  SiFacebook,
  SiFacebookHex,
  SiReddit,
  SiRedditHex,
} from "@icons-pack/react-simple-icons";
import { Bird, Check, Link2, MessageSquare, Share2 } from "lucide-react";
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

/** Twitter's brand blue, kept locally since simple-icons dropped the Twitter bird in favor of X. */
const TWITTER_BLUE = "#1D9BF0";

/**
 * A ghost icon button that opens a share dialog with platform and copy-link options.
 *
 * Platforms: Twitter (bird), Facebook, Reddit, Bluesky, SMS.
 * The share URL encodes the current MapState as URL-safe base64 in the `s` query parameter.
 * If the encoded state exceeds the URL length limit, share options are replaced with
 * a friendly "too long" message.
 *
 * @returns A button that opens the share dialog.
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

  const openShare = (url: string): void => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleTwitter = (): void => {
    const url = buildShareUrl();
    openShare(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent("Check out my travel map!")}&url=${encodeURIComponent(url)}`
    );
  };

  const handleFacebook = (): void => {
    openShare(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(buildShareUrl())}`
    );
  };

  const handleReddit = (): void => {
    const url = buildShareUrl();
    openShare(
      `https://www.reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent("My travel map")}`
    );
  };

  const handleBluesky = (): void => {
    const url = buildShareUrl();
    openShare(
      `https://bsky.app/intent/compose?text=${encodeURIComponent(`Check out my travel map! ${url}`)}`
    );
  };

  const handleSms = (): void => {
    const url = buildShareUrl();
    window.location.href = `sms:?body=${encodeURIComponent(`Check out my travel map! ${url}`)}`;
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
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-5 gap-2">
                <PlatformButton label="Twitter" onClick={handleTwitter}>
                  <Bird className="h-5 w-5" style={{ color: TWITTER_BLUE }} aria-hidden="true" />
                </PlatformButton>
                <PlatformButton label="Facebook" onClick={handleFacebook}>
                  <SiFacebook className="h-5 w-5" color={SiFacebookHex} aria-hidden="true" />
                </PlatformButton>
                <PlatformButton label="Reddit" onClick={handleReddit}>
                  <SiReddit className="h-5 w-5" color={SiRedditHex} aria-hidden="true" />
                </PlatformButton>
                <PlatformButton label="Bluesky" onClick={handleBluesky}>
                  <SiBluesky className="h-5 w-5" color={SiBlueskyHex} aria-hidden="true" />
                </PlatformButton>
                <PlatformButton label="SMS" onClick={handleSms}>
                  <MessageSquare className="h-5 w-5 text-green-500" aria-hidden="true" />
                </PlatformButton>
              </div>
              <Button
                variant="outline"
                className="w-full justify-center gap-2"
                onClick={handleCopy}
              >
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

type PlatformButtonProps = {
  /** Platform name shown as a label below the icon. */
  label: string;
  /** Click handler for the platform share action. */
  onClick: () => void;
  /** Brand icon for the platform. */
  children: React.ReactNode;
};

/**
 * A compact square button showing a brand icon and platform label.
 *
 * @param props - Label, click handler, and icon.
 * @returns A bordered button card.
 */
const PlatformButton = ({ label, onClick, children }: PlatformButtonProps): ReactElement => (
  <button
    onClick={onClick}
    className="flex flex-col items-center gap-1.5 rounded-lg border border-border bg-background px-2 py-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    aria-label={`Share on ${label}`}
  >
    {children}
    {label}
  </button>
);
