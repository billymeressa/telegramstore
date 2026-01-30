import React from 'react';

const GamificationProgressBar = ({
    current = 0,
    target = 1000,
    label = "Progress to Free Gift"
}) => {
    return (
        <div>
            <h3>{label}</h3>
            <span>{current} / {target} ETB</span>
            <progress value={current} max={target}></progress>
            <p>
                {current >= target
                    ? "Goal Reached! Claim your reward!"
                    : `Earn ${target - current} more points to unlock!`
                }
            </p>
        </div>
    );
};

export default GamificationProgressBar;
