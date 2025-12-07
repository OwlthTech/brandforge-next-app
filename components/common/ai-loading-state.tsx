"use client";

/**
 * @author: @kokonutui
 * @description: AI Loading State
 * @version: 1.0.0
 * @date: 2025-06-26
 * @license: MIT
 * @website: https://kokonutui.com
 * @github: https://github.com/kokonut-labs/kokonutui
 */

import { useEffect, useState, useRef } from "react";
import { Loader } from "@/components/ui/loader";

const BRAND_GUIDELINE_SEQUENCES = [
  {
    status: "Analyzing brand identity",
    lines: [
      "Loading brand information...",
      "Analyzing brand colors and palette...",
      "Reviewing brand description...",
      "Checking logo assets...",
      "Understanding brand industry...",
    ],
  },
  {
    status: "Generating brand story",
    lines: [
      "Crafting mission statement...",
      "Defining brand vision...",
      "Establishing core values...",
      "Creating brand personality...",
      "Identifying target audience...",
    ],
  },
  {
    status: "Creating design guidelines",
    lines: [
      "Defining color palette rules...",
      "Establishing typography standards...",
      "Creating logo usage guidelines...",
      "Setting imagery standards...",
      "Finalizing brand voice...",
    ],
  },
];

const PRODUCT_GUIDELINE_SEQUENCES = [
  {
    status: "Analyzing product details",
    lines: [
      "Loading product information...",
      "Reviewing product images...",
      "Analyzing product category...",
      "Understanding product positioning...",
      "Checking design references...",
    ],
  },
  {
    status: "Creating messaging framework",
    lines: [
      "Crafting product positioning...",
      "Defining key messages...",
      "Creating value propositions...",
      "Establishing tone of voice...",
      "Finalizing messaging hierarchy...",
    ],
  },
  {
    status: "Generating asset requirements",
    lines: [
      "Defining marketplace standards...",
      "Creating social media guidelines...",
      "Setting visual requirements...",
      "Establishing image specifications...",
      "Finalizing asset templates...",
    ],
  },
];

const LoadingAnimation = ({ progress }: { progress: number }) => (
  <div className="relative w-6 h-6">
    <Loader variant="spinner" size="sm" className="text-primary" />
  </div>
);

interface AILoadingStateProps {
  type?: "brand" | "product";
}

export function AILoadingState({ type = "brand" }: AILoadingStateProps) {
  const TASK_SEQUENCES = type === "brand" ? BRAND_GUIDELINE_SEQUENCES : PRODUCT_GUIDELINE_SEQUENCES;
  
  const [sequenceIndex, setSequenceIndex] = useState(0);
  const [visibleLines, setVisibleLines] = useState<Array<{ text: string; number: number }>>([]);
  const [scrollPosition, setScrollPosition] = useState(0);
  const codeContainerRef = useRef<HTMLDivElement>(null);
  const lineHeight = 28;

  const currentSequence = TASK_SEQUENCES[sequenceIndex];
  const totalLines = currentSequence.lines.length;

  useEffect(() => {
    const initialLines = [];
    for (let i = 0; i < Math.min(5, totalLines); i++) {
      initialLines.push({
        text: currentSequence.lines[i],
        number: i + 1,
      });
    }
    setVisibleLines(initialLines);
    setScrollPosition(0);
  }, [sequenceIndex, currentSequence.lines, totalLines]);

  // Handle line advancement
  useEffect(() => {
    const advanceTimer = setInterval(() => {
      const firstVisibleLineIndex = Math.floor(scrollPosition / lineHeight);
      const nextLineIndex = (firstVisibleLineIndex + 3) % totalLines;

      if (nextLineIndex < firstVisibleLineIndex && nextLineIndex !== 0) {
        setSequenceIndex((prevIndex) => (prevIndex + 1) % TASK_SEQUENCES.length);
        return;
      }

      if (nextLineIndex >= visibleLines.length && nextLineIndex < totalLines) {
        setVisibleLines((prevLines) => [
          ...prevLines,
          {
            text: currentSequence.lines[nextLineIndex],
            number: nextLineIndex + 1,
          },
        ]);
      }

      setScrollPosition((prevPosition) => prevPosition + lineHeight);
    }, 2000);

    return () => clearInterval(advanceTimer);
  }, [scrollPosition, visibleLines, totalLines, sequenceIndex, currentSequence.lines, lineHeight, TASK_SEQUENCES.length]);

  // Apply scroll position
  useEffect(() => {
    if (codeContainerRef.current) {
      codeContainerRef.current.scrollTop = scrollPosition;
    }
  }, [scrollPosition]);

  return (
    <div className="flex items-start justify-start min-h-full w-full">
      <div className="space-y-4 w-auto">
        <div className="ml-2 flex items-center space-x-2 text-gray-600 dark:text-gray-300 font-medium">
          <LoadingAnimation progress={(sequenceIndex / TASK_SEQUENCES.length) * 100} />
          <span className="text-sm">{currentSequence.status}...</span>
        </div>

        <div className="relative">
          <div
            ref={codeContainerRef}
            className="font-mono text-xs overflow-hidden w-full h-[84px] relative rounded-lg"
            style={{ scrollBehavior: "smooth" }}
          >
            <div>
              {visibleLines.map((line) => (
                <div key={`${line.number}-${line.text}`} className="flex h-7 items-center px-2">
                  <div className="text-gray-400 dark:text-gray-500 pr-3 select-none w-6 text-right">
                    {line.number}
                  </div>
                  <div className="text-gray-800 dark:text-gray-200 flex-1 ml-1">{line.text}</div>
                </div>
              ))}
            </div>
          </div>

          <div
            className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none rounded-lg from-white/90 via-white/50 to-transparent dark:from-black/90 dark:via-black/50 dark:to-transparent"
            style={{
              background: "linear-gradient(to bottom, var(--tw-gradient-from) 0%, var(--tw-gradient-via) 30%, var(--tw-gradient-to) 100%)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
