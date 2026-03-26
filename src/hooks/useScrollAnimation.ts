import { useRef } from "react";
import { useInView } from "framer-motion";

interface ScrollAnimationOptions {
    once?: boolean;
    amount?: "some" | "all" | number;
    margin?: string;
}

export function useScrollAnimation(options: ScrollAnimationOptions = {}) {
    const { once = false, amount = 0.3, margin = "0px 0px -100px 0px" } = options;
    const ref = useRef(null);
    const isInView = useInView(ref, { once, amount: amount as any, margin });

    return { ref, isInView };
}
