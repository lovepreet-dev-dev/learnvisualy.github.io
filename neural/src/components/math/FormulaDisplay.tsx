import React, { useEffect, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface FormulaDisplayProps {
    tex: string;
}

export const FormulaDisplay: React.FC<FormulaDisplayProps> = ({ tex }) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (containerRef.current) {
            katex.render(tex, containerRef.current, {
                throwOnError: false,
                displayMode: true
            });
        }
    }, [tex]);

    return <div ref={containerRef} className="text-slate-200 text-lg" />;
};
