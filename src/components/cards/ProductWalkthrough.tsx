"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Play, ExternalLink } from "lucide-react";

interface WalkthroughStep {
  image?: string;
  title: string;
  description: string;
}

interface YouTubeReview {
  videoId: string;
  title: string;
  channel: string;
}

interface ProductWalkthroughProps {
  walkthrough?: {
    title: string;
    steps: WalkthroughStep[];
  };
  youtubeReviews?: YouTubeReview[];
  companyName: string;
}

export default function ProductWalkthrough({
  walkthrough,
  youtubeReviews,
  companyName,
}: ProductWalkthroughProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [showVideo, setShowVideo] = useState<string | null>(null);

  if (!walkthrough && (!youtubeReviews || youtubeReviews.length === 0)) {
    return null;
  }

  const steps = walkthrough?.steps ?? [];

  return (
    <div className="space-y-5">
      {/* Walkthrough Carousel */}
      {walkthrough && steps.length > 0 && (
        <div
          className="rounded-xl overflow-hidden"
          style={{
            background: "#ffffff",
            border: "1px solid var(--md-sys-color-outline)",
            boxShadow: "var(--elevation-2)",
          }}
        >
          <div
            className="px-5 py-3 flex items-center justify-between"
            style={{
              background: "var(--md-sys-color-surface-container)",
              borderBottom: "1px solid var(--md-sys-color-outline)",
            }}
          >
            <div>
              <h3
                className="text-sm font-semibold"
                style={{ color: "var(--md-sys-color-on-surface)" }}
              >
                {walkthrough.title}
              </h3>
              <p
                className="text-xs mt-0.5"
                style={{ color: "var(--md-sys-color-on-surface-variant)" }}
              >
                Step {activeStep + 1} of {steps.length}
              </p>
            </div>

            {/* Step navigation dots */}
            <div className="flex items-center gap-1.5">
              {steps.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveStep(i)}
                  className="transition-all rounded-full"
                  style={{
                    width: i === activeStep ? 20 : 8,
                    height: 8,
                    background:
                      i === activeStep
                        ? "var(--md-sys-color-primary)"
                        : "var(--md-sys-color-outline)",
                  }}
                />
              ))}
            </div>
          </div>

          {/* Active step content */}
          <div className="relative">
            {/* Image area */}
            {steps[activeStep]?.image ? (
              <div className="relative">
                <img
                  src={steps[activeStep].image}
                  alt={steps[activeStep].title}
                  className="w-full object-cover"
                  style={{
                    maxHeight: 420,
                    background: "var(--md-sys-color-surface-container)",
                  }}
                />
                {/* Text overlay at bottom */}
                <div
                  className="absolute bottom-0 left-0 right-0 px-5 py-4"
                  style={{
                    background:
                      "linear-gradient(transparent, rgba(0,0,0,0.75))",
                  }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className="inline-flex items-center justify-center rounded-full text-xs font-bold text-white"
                      style={{
                        width: 24,
                        height: 24,
                        background: "var(--md-sys-color-primary)",
                        flexShrink: 0,
                      }}
                    >
                      {activeStep + 1}
                    </span>
                    <h4 className="text-sm font-semibold text-white">
                      {steps[activeStep].title}
                    </h4>
                  </div>
                  <p className="text-xs text-gray-200 leading-relaxed ml-8">
                    {steps[activeStep].description}
                  </p>
                </div>
              </div>
            ) : (
              /* No image — show text-only step */
              <div className="px-5 py-6">
                <div className="flex items-start gap-3">
                  <span
                    className="inline-flex items-center justify-center rounded-full text-xs font-bold text-white flex-shrink-0"
                    style={{
                      width: 28,
                      height: 28,
                      background: "var(--md-sys-color-primary)",
                    }}
                  >
                    {activeStep + 1}
                  </span>
                  <div>
                    <h4
                      className="text-sm font-semibold mb-1"
                      style={{ color: "var(--md-sys-color-on-surface)" }}
                    >
                      {steps[activeStep].title}
                    </h4>
                    <p
                      className="text-sm leading-relaxed"
                      style={{
                        color: "var(--md-sys-color-on-surface-variant)",
                      }}
                    >
                      {steps[activeStep].description}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Prev/Next arrows */}
            {steps.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setActiveStep((s) => (s > 0 ? s - 1 : steps.length - 1))
                  }
                  className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full p-1.5 transition-colors"
                  style={{
                    background: "rgba(255,255,255,0.9)",
                    boxShadow: "var(--elevation-1)",
                    color: "var(--md-sys-color-on-surface)",
                  }}
                >
                  <ChevronLeft style={{ width: 18, height: 18 }} />
                </button>
                <button
                  onClick={() =>
                    setActiveStep((s) => (s < steps.length - 1 ? s + 1 : 0))
                  }
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1.5 transition-colors"
                  style={{
                    background: "rgba(255,255,255,0.9)",
                    boxShadow: "var(--elevation-1)",
                    color: "var(--md-sys-color-on-surface)",
                  }}
                >
                  <ChevronRight style={{ width: 18, height: 18 }} />
                </button>
              </>
            )}
          </div>

          {/* Step list below */}
          <div
            className="px-5 py-3 flex gap-2 overflow-x-auto"
            style={{
              borderTop: "1px solid var(--md-sys-color-outline)",
              background: "var(--md-sys-color-surface-container)",
            }}
          >
            {steps.map((step, i) => (
              <button
                key={i}
                onClick={() => setActiveStep(i)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap flex-shrink-0"
                style={{
                  background:
                    i === activeStep
                      ? "var(--md-sys-color-primary)"
                      : "transparent",
                  color:
                    i === activeStep
                      ? "#ffffff"
                      : "var(--md-sys-color-on-surface-variant)",
                  border:
                    i === activeStep
                      ? "none"
                      : "1px solid var(--md-sys-color-outline)",
                }}
              >
                <span className="font-bold">{i + 1}</span>
                {step.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* YouTube Reviews */}
      {youtubeReviews && youtubeReviews.length > 0 && (
        <div
          className="rounded-xl p-5"
          style={{
            background: "#ffffff",
            border: "1px solid var(--md-sys-color-outline)",
            boxShadow: "var(--elevation-1)",
          }}
        >
          <h3
            className="text-sm font-semibold mb-3"
            style={{ color: "var(--md-sys-color-on-surface)" }}
          >
            Video Reviews & Demos
          </h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {youtubeReviews.map((video) => (
              <div key={video.videoId}>
                {showVideo === video.videoId ? (
                  <div className="aspect-video rounded-lg overflow-hidden">
                    <iframe
                      src={`https://www.youtube-nocookie.com/embed/${video.videoId}?autoplay=1`}
                      className="w-full h-full"
                      allow="autoplay; encrypted-media"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <button
                    onClick={() => setShowVideo(video.videoId)}
                    className="w-full text-left group"
                  >
                    <div className="relative aspect-video rounded-lg overflow-hidden">
                      <img
                        src={`https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`}
                        alt={video.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                        <div
                          className="rounded-full p-2.5"
                          style={{
                            background: "rgba(255,255,255,0.95)",
                            boxShadow: "var(--elevation-2)",
                          }}
                        >
                          <Play
                            style={{
                              width: 18,
                              height: 18,
                              color: "var(--md-sys-color-primary)",
                              fill: "var(--md-sys-color-primary)",
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </button>
                )}
                <div className="mt-1.5">
                  <p
                    className="text-xs font-medium line-clamp-2"
                    style={{ color: "var(--md-sys-color-on-surface)" }}
                  >
                    {video.title}
                  </p>
                  <p
                    className="text-xs mt-0.5"
                    style={{ color: "var(--md-sys-color-on-surface-muted)" }}
                  >
                    {video.channel}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
