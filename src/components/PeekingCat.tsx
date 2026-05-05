import { useEffect, useState, useRef } from "react";

type Edge = "top" | "bottom" | "left" | "right";

// Фазы:
// "hidden"    — кот за краем экрана, transition выключен (телепорт)
// "entering"  — кот выезжает из-за края к центру, transition включён
// "visible"   — кот на месте
// "leaving"   — кот уезжает за край, transition включён
type Phase = "hidden" | "entering" | "visible" | "leaving";

interface CatState {
    edge: Edge;
    offset: number;
    phase: Phase;
}

const CAT_W = 209;
const CAT_H = 74;
const VISIBLE_MS = 5000;

function getTranslate(edge: Edge, phase: Phase): string {
    // "hidden" и "leaving" — за краем экрана
    // "entering" и "visible" — на месте (translateX/Y = 0)
    const behind = phase === "hidden" || phase === "leaving";

    switch (edge) {
        case "bottom":
            return behind ? `translateY(${CAT_H}px)` : "translateY(0)";
        case "top":
            return behind ? `translateY(-${CAT_H}px)` : "translateY(0)";
        case "left":
            return behind ? `translateX(-${CAT_H}px)` : "translateX(0)";
        case "right":
            return behind ? `translateX(${CAT_H}px)` : "translateX(0)";
    }
}

function buildStyles(
    edge: Edge,
    offset: number,
    phase: Phase,
): { wrapper: React.CSSProperties; img: React.CSSProperties } {
    const animated = phase === "entering" || phase === "leaving";
    const transition = animated
        ? "transform 0.8s ease, opacity 0.7s ease"
        : "none";

    const translate = getTranslate(edge, phase);
    const opacity =
        phase === "hidden"
            ? 0
            : phase === "entering" || phase === "visible"
              ? 1
              : 0;

    const wrapperBase: React.CSSProperties = {
        position: "fixed",
        zIndex: 9999,
        pointerEvents: "none",
        overflow: "visible",
        transition,
        opacity,
    };

    switch (edge) {
        case "bottom":
            return {
                wrapper: {
                    ...wrapperBase,
                    width: CAT_W,
                    height: CAT_H,
                    left: `calc(${offset}% - ${CAT_W / 2}px)`,
                    bottom: 0,
                    transform: translate,
                },
                img: { width: CAT_W, height: CAT_H, display: "block" },
            };

        case "top":
            return {
                wrapper: {
                    ...wrapperBase,
                    width: CAT_W,
                    height: CAT_H,
                    left: `calc(${offset}% - ${CAT_W / 2}px)`,
                    top: 0,
                    transform: translate,
                },
                img: {
                    width: CAT_W,
                    height: CAT_H,
                    display: "block",
                    transform: "rotate(180deg)",
                },
            };

        case "left":
            return {
                wrapper: {
                    ...wrapperBase,
                    width: CAT_H,
                    height: CAT_W,
                    left: 0,
                    top: `calc(${offset}% - ${CAT_W / 2}px)`,
                    transform: translate,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                },
                img: {
                    width: CAT_W,
                    height: CAT_H,
                    display: "block",
                    transform: "rotate(90deg)",
                    flexShrink: 0,
                },
            };

        case "right":
            return {
                wrapper: {
                    ...wrapperBase,
                    width: CAT_H,
                    height: CAT_W,
                    right: 0,
                    left: "auto",
                    top: `calc(${offset}% - ${CAT_W / 2}px)`,
                    transform: translate,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                },
                img: {
                    width: CAT_W,
                    height: CAT_H,
                    display: "block",
                    transform: "rotate(-90deg)",
                    flexShrink: 0,
                },
            };
    }
}

function randomEdge(): Edge {
    return (["bottom", "top", "left", "right"] as Edge[])[
        Math.floor(Math.random() * 4)
    ];
}
function randomOffset() {
    return 10 + Math.random() * 70;
}
function randomDelay() {
    return Math.random() * 3000;
}

export function PeekingCat() {
    const [cat, setCat] = useState<CatState>({
        edge: "bottom",
        offset: 50,
        phase: "hidden",
    });
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const clear = () => {
        if (timerRef.current) clearTimeout(timerRef.current);
    };

    const schedule = () => {
        clear();
        timerRef.current = setTimeout(() => {
            const edge = randomEdge();
            const offset = randomOffset();

            setCat({ edge, offset, phase: "hidden" });

            timerRef.current = setTimeout(() => {
                setCat({ edge, offset, phase: "entering" });

                timerRef.current = setTimeout(() => {
                    setCat({ edge, offset, phase: "leaving" });
                    timerRef.current = setTimeout(schedule, 900);
                }, VISIBLE_MS);
            }, 32);
        }, randomDelay());
    };

    useEffect(() => {
        schedule();
        return clear;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const { wrapper, img } = buildStyles(cat.edge, cat.offset, cat.phase);

    return (
        <div style={wrapper}>
            <img
                src="/cat.png"
                alt="Подглядывающий кот"
                style={img}
                draggable={false}
            />
        </div>
    );
}
