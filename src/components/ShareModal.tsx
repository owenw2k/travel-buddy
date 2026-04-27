"use client";

/**
 * Share button and dialog.
 *
 * On open, generates three images (stats card, US map, world map) in the
 * background. A preview of the stats card is shown while generating. The
 * primary share action uses the Web Share API to post the images directly
 * to any app the OS supports (Twitter, Instagram, etc.) with a link back
 * to Travel Buddy. Platform-specific link buttons and a download fallback
 * are shown for environments that don't support file sharing.
 */

import {
  SiBluesky,
  SiBlueskyHex,
  SiFacebook,
  SiFacebookHex,
  SiReddit,
  SiRedditHex,
} from "@icons-pack/react-simple-icons";
import { Bird, Check, Download, Link2, MessageSquare, Share2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { MapExportRenderer, EXPORT_W, EXPORT_H } from "@/components/MapExportRenderer";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { captureElement, downloadBlob } from "@/lib/exportImages";
import { encodeState, isShareUrlTooLong } from "@/lib/share";
import { useMapStore } from "@/store/mapStore";

import type { ReactElement } from "react";

/** Twitter brand blue — simple-icons only ships the X logo now. */
const TWITTER_BLUE = "#1D9BF0";

/** The Travel Buddy live URL used as the back-link in shares. */
const APP_URL = "https://travel-buddy-sooty-ten.vercel.app/";

type Blobs = { stats: Blob; world: Blob; us: Blob };

/**
 * Checks whether the browser supports sharing files via the Web Share API.
 *
 * @param files - Sample file array to test against `navigator.canShare`.
 * @returns True if the browser can share the given files natively.
 */
const canShareFiles = (files: File[]): boolean =>
  typeof navigator !== "undefined" && !!navigator.canShare?.({ files });

/**
 * A ghost icon button that opens a share dialog.
 *
 * Images are generated as soon as the dialog opens. A stats card preview
 * is displayed while the maps render. Once ready, the primary action uses
 * the Web Share API to share all three images with a link back to the app.
 * Platform link buttons and a download fallback handle unsupported browsers.
 *
 * @returns A button that opens the share dialog.
 */
export const ShareModal = (): ReactElement => {
  const [open, setOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showRenderer, setShowRenderer] = useState(false);
  const [blobs, setBlobs] = useState<Blobs | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const previewUrlRef = useRef<string | null>(null);

  const { world, legends, regions } = useMapStore();

  const encoded = encodeState({ world, legends, regions });
  const tooLong = isShareUrlTooLong(encoded);

  /** Revoke the stats preview object URL when it's no longer needed. */
  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
      }
    };
  }, []);

  const handleOpenChange = (value: boolean): void => {
    setOpen(value);
    if (value && !blobs) {
      setIsGenerating(true);
      setShowRenderer(true);
    }
  };

  const handleExportReady = useCallback(
    async (refs: { stats: HTMLDivElement; world: HTMLDivElement; us: HTMLDivElement }) => {
      try {
        const [statsBlob, worldBlob, usBlob] = await Promise.all([
          captureElement(refs.stats, EXPORT_W, EXPORT_H),
          captureElement(refs.world, EXPORT_W, EXPORT_H),
          captureElement(refs.us, EXPORT_W, EXPORT_H),
        ]);

        const url = URL.createObjectURL(statsBlob);
        previewUrlRef.current = url;
        setPreviewUrl(url);
        setBlobs({ stats: statsBlob, world: worldBlob, us: usBlob });
      } finally {
        setIsGenerating(false);
        setShowRenderer(false);
      }
    },
    []
  );

  const handleWebShare = async (): Promise<void> => {
    if (!blobs) {
      return;
    }
    const files = [
      new File([blobs.stats], "travel-buddy-stats.png", { type: "image/png" }),
      new File([blobs.world], "travel-buddy-world.png", { type: "image/png" }),
      new File([blobs.us], "travel-buddy-us.png", { type: "image/png" }),
    ];
    await navigator.share({
      files,
      title: "My Travel Map",
      text: "Check out my travel map!",
      url: APP_URL,
    });
  };

  const handleDownload = (): void => {
    if (!blobs) {
      return;
    }
    downloadBlob(blobs.stats, "travel-buddy-stats.png");
    setTimeout(() => downloadBlob(blobs.world, "travel-buddy-world.png"), 300);
    setTimeout(() => downloadBlob(blobs.us, "travel-buddy-us.png"), 600);
  };

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

  const sampleFiles = blobs
    ? [new File([blobs.stats], "travel-buddy-stats.png", { type: "image/png" })]
    : [];
  const supportsFileShare = blobs !== null && canShareFiles(sampleFiles);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground"
        aria-label="Share map"
        onClick={() => handleOpenChange(true)}
      >
        <Share2 className="h-4 w-4" aria-hidden="true" />
      </Button>

      {showRenderer && <MapExportRenderer onReady={handleExportReady} />}

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Share your map</DialogTitle>
            <DialogDescription>
              {tooLong
                ? "Your map is too large to share as a link. Use the image share or download instead."
                : "Share your map as an image or send a link."}
            </DialogDescription>
          </DialogHeader>

          {/* Stats image preview */}
          <div className="overflow-hidden rounded-lg border border-border">
            {isGenerating ? (
              <Skeleton className="aspect-video w-full" />
            ) : previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt="Stats preview"
                className="w-full"
                style={{ aspectRatio: "16/9", objectFit: "cover" }}
              />
            ) : null}
          </div>

          <div className="flex flex-col gap-3">
            {/* Primary: Web Share API with images */}
            {supportsFileShare ? (
              <Button className="w-full gap-2" onClick={handleWebShare}>
                <Share2 className="h-4 w-4" aria-hidden="true" />
                Share image
              </Button>
            ) : (
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={handleDownload}
                disabled={!blobs}
              >
                <Download className="h-4 w-4" aria-hidden="true" />
                {blobs ? "Download images" : "Generating images..."}
              </Button>
            )}

            {/* Link sharing */}
            {!tooLong && (
              <>
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
              </>
            )}
          </div>
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
