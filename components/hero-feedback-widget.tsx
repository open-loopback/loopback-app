"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Loopback } from "open-loopback";
import "open-loopback/style.css";

export const HeroFeedbackWidget = () => {
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return null; // Don't show anything while mounting for a floating widget
    }

    return (
        <Loopback
            sourceId="src_22e3eb84e09074104685538567745bd2"
            variant="modal"
            defaultOpen={false}
            theme={{
                darkMode: resolvedTheme === "dark",
                primaryColor: "oklch(0.627 0.265 303.9)", // matches the theme primary indigo
                borderRadius: "0.75rem"
            }}
            content={{
                title: "What do you think?",
                subtitle: "Help us improve our widgets"
            }}
        />
    );
};
