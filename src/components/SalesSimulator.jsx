import React, { useState, useMemo } from 'react';

const SalesSimulator = () => {
    const [traffic, setTraffic] = useState(1000);
    const [conversion, setConversion] = useState(2);
    const [aov, setAov] = useState(500);
    const [margin, setMargin] = useState(30);
    const [discount, setDiscount] = useState(20);
    const [volumeBoost, setVolumeBoost] = useState(50);
    const [adSpend, setAdSpend] = useState(1000);

    const results = useMemo(() => {
        const currentSales = (traffic * (conversion / 100)) * aov;
        const currentProfit = currentSales * (margin / 100) - adSpend;

        const newTraffic = traffic; // Assumption: traffic same unless ad spend increases logic added
        const newConversion = conversion * 1.5; // Simple assumption
        const newAov = aov * (1 - discount / 100);
        const newVolume = (traffic * (newConversion / 100)) * (1 + volumeBoost / 100);

        const projectedSales = newVolume * newAov;
        const projectedProfit = projectedSales * ((margin - discount) / 100) - adSpend;

        return {
            currentSales, currentProfit, projectedSales, projectedProfit
        };
    }, [traffic, conversion, aov, margin, discount, volumeBoost, adSpend]);

    return (
        <div>
            <h3>Sales & Profit Simulator</h3>
            <div>
                <label>Monthly Traffic: <input type="number" value={traffic} onChange={e => setTraffic(Number(e.target.value))} /></label>
                <br />
                <label>Conversion Rate (%): <input type="number" value={conversion} onChange={e => setConversion(Number(e.target.value))} /></label>
                <br />
                <label>Avg Order Value: <input type="number" value={aov} onChange={e => setAov(Number(e.target.value))} /></label>
                <br />
                <label>Profit Margin (%): <input type="number" value={margin} onChange={e => setMargin(Number(e.target.value))} /></label>
            </div>

            <hr />

            <div>
                <h4>Campaign Settings</h4>
                <label>Discount Offer (%): <input type="number" value={discount} onChange={e => setDiscount(Number(e.target.value))} /></label>
                <br />
                <label>Expected Volume Lift (%): <input type="number" value={volumeBoost} onChange={e => setVolumeBoost(Number(e.target.value))} /></label>
                <br />
                <label>Ad Spend Budget: <input type="number" value={adSpend} onChange={e => setAdSpend(Number(e.target.value))} /></label>
            </div>

            <hr />

            <div>
                <h4>Results</h4>
                <p>Current Profit: {Math.round(results.currentProfit)}</p>
                <p>Projected Profit: {Math.round(results.projectedProfit)}</p>
                <p>Difference: {Math.round(results.projectedProfit - results.currentProfit)}</p>
            </div>
        </div>
    );
};

export default SalesSimulator;
