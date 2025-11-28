// hooks/useInfiniteLoop.ts
import { useRef, useEffect, useCallback } from "react";

export function useInfiniteLoop<T>(items: T[], itemWidth: number) {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const extendedItems = [...items, ...items];

  const scroll = useCallback((direction: "left" | "right") => {
    const container = containerRef.current;
    if (!container) return;

    const scrollAmount = itemWidth; 
    const currentScroll = container.scrollLeft;

    let newScroll =
      direction === "right"
        ? currentScroll + scrollAmount
        : currentScroll - scrollAmount;

    container.scrollTo({
      left: newScroll,
      behavior: "smooth",
    });
  }, [itemWidth]);

  const handleScrollReset = () => {
    const container = containerRef.current;
    if (!container) return;

    const scrollLeft = container.scrollLeft;
    const scrollWidth = container.scrollWidth;

    const singleSetWidth = scrollWidth / 2;

    if (scrollLeft >= singleSetWidth) {
      container.scrollLeft = scrollLeft - singleSetWidth;
    }
    
    else if (scrollLeft <= 0) {
      container.scrollLeft = singleSetWidth + scrollLeft; 
    }
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener("scroll", handleScrollReset);
    return () => container.removeEventListener("scroll", handleScrollReset);
  }, [items]); 

  return {
    containerRef,
    extendedItems, 
    scroll,
  };
}