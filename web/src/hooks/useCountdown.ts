import { useState, useEffect } from "react";

export const useCountdown = (intervalMs: number = 1000) => {
    const [tick, setTick] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setTick((prev) => prev + 1);
        }, intervalMs);

        return () => clearInterval(timer);
    }, [intervalMs]);

    return tick;
};
