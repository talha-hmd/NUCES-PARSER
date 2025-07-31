import { useEffect } from 'react';

const Cursor = () => {
    useEffect(() => {
        const cursorDot = document.querySelector("[data-cursor-dot]");
        const cursorOutline = document.querySelector("[data-cursor-outline]");

        let mouseX = 0, mouseY = 0;
        let outlineX = 0, outlineY = 0;

        const lerp = (start, end, amt) => (1 - amt) * start + amt * end;

        const updatePosition = () => {
            outlineX = lerp(outlineX, mouseX, 0.17); // control smoothness (lower = slower)
            outlineY = lerp(outlineY, mouseY, 0.17);

            cursorDot.style.left = `${mouseX}px`;
            cursorDot.style.top = `${mouseY}px`;

            cursorOutline.style.left = `${outlineX}px`;
            cursorOutline.style.top = `${outlineY}px`;

            requestAnimationFrame(updatePosition);
        };

        window.addEventListener("mousemove", (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        requestAnimationFrame(updatePosition);

        return () => {
            window.removeEventListener("mousemove", () => { });
        };
    }, []);

    return (
        <>
            <div
                data-cursor-dot
                className="cursor-dot fixed top-0 left-0 w-[5px] h-[5px] bg-white rounded-full z-50 pointer-events-none"
            ></div>
            <div
                data-cursor-outline
                className="cursor-outline fixed top-0 left-0 w-[30px] h-[30px] border-2 border-white/40 rounded-full z-50 pointer-events-none"
            ></div>
        </>
    );
};

export default Cursor;
