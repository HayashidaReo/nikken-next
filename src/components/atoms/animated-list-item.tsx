"use client";

import React from "react";
import { motion } from "framer-motion";
import type { ComponentPropsWithoutRef } from "react";
import type { HTMLMotionProps } from "framer-motion";
import { rowVariants, rowTransition } from "@/lib/animation";

type Props = Omit<ComponentPropsWithoutRef<"div">, "onDrag"> & {
    disabledMotion?: boolean;
};

/**
 * AnimatedListItem
 * - `motion.div` をラップした共通コンポーネント。
 * - list の enter/exit の共通 variants/transition を中央管理する。
 */
const AnimatedListItem = React.forwardRef<HTMLDivElement, Props>(
    ({ children, className, disabledMotion = false, ...rest }, ref) => {
        const divProps = rest as ComponentPropsWithoutRef<"div">;

        if (disabledMotion) {
            return (
                <div ref={ref} className={className} {...divProps}>
                    {children}
                </div>
            );
        }

        return (
            <motion.div
                ref={ref}
                layout
                variants={rowVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={rowTransition}
                className={className}
                {...(divProps as unknown as HTMLMotionProps<"div">)}
            >
                {children}
            </motion.div>
        );
    }
);

AnimatedListItem.displayName = "AnimatedListItem";

export { AnimatedListItem };
