import React from 'react';

const AnimatingBall = () => {
    return (
        <div className="absolute -translate-y-[-100px] left-1/2 -translate-x-1/2 z-[3] w-[400px] h-[400px] pointer-events-none">
            <div className="relative w-full h-full">
                <div className="ball-line-1" />
                <div className="ball-line-2" />
                <div className="ball-line-3" />
            </div>
        </div>
    );
};

export default AnimatingBall;
