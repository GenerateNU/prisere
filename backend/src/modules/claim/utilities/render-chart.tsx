/** @jsxImportSource react */

import { Svg, Rect, Line, Circle, G, Text as SvgText } from "@react-pdf/renderer";

interface FinancialData {
    year: number;
    amountCents: number;
}

interface ChartProps {
    revenues: FinancialData[];
    purchases: FinancialData[];
}

export function FinancialChart({ revenues, purchases }: ChartProps) {
    if (!revenues || !purchases || revenues.length === 0 || purchases.length === 0) {
        return null;
    }

    // Chart dimensions
    const width = 320;
    const height = 220;
    const padding = { top: 20, right: 40, bottom: 60, left: 50 };
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // sort
    const sortedRevenues = [...revenues].sort((a, b) => a.year - b.year);
    const sortedPurchases = [...purchases].sort((a, b) => a.year - b.year);

    // to dollars
    const revenueValues = sortedRevenues.map((r) => r.amountCents / 100);
    const purchaseValues = sortedPurchases.map((p) => p.amountCents / 100);
    const years = sortedRevenues.map((r) => r.year);

    const maxValue = Math.max(...revenueValues, ...purchaseValues);
    const yAxisMax = maxValue === 0 ? 1000 : Math.ceil(maxValue / 1000) * 1000;

    const yTicks = 5;
    const yTickValues = Array.from({ length: yTicks }, (_, i) => (yAxisMax / (yTicks - 1)) * i);

    const barWidth = 30;
    const groupSpacing = chartWidth / years.length;
    const barSpacing = 8;

    const getYPosition = (value: number) => {
        return padding.top + chartHeight - (value / yAxisMax) * chartHeight;
    };

    const formatCurrency = (value: number) => {
        return `$${(value / 1000).toFixed(0)}K`;
    };

    const legendY = height - 10;
    const legendX = width / 2 - 80;

    return (
        <Svg width={width} height={height} style={{ backgroundColor: "white" }}>
            {yTickValues.map((tick, i) => (
                <Line
                    key={`grid-${i}`}
                    x1={padding.left}
                    y1={getYPosition(tick)}
                    x2={width - padding.right}
                    y2={getYPosition(tick)}
                    stroke="#e5e5e5"
                    strokeWidth="1"
                />
            ))}

            {yTickValues.map((tick, i) => (
                <SvgText
                    key={`y-label-${i}`}
                    x={padding.left - 10}
                    y={getYPosition(tick) + 4}
                    textAnchor="end"
                    style={{ fontSize: "11px" }}
                    fill="#666"
                >
                    {formatCurrency(tick)}
                </SvgText>
            ))}

            {years.map((year, i) => {
                const groupX = padding.left + i * groupSpacing + groupSpacing / 2;
                const revenueBarX = groupX - barWidth - barSpacing / 2;
                const purchaseBarX = groupX + barSpacing / 2;

                const revenueHeight = (revenueValues[i] / yAxisMax) * chartHeight;
                const purchaseHeight = (purchaseValues[i] / yAxisMax) * chartHeight;

                return (
                    <G key={`group-${year}`}>
                        <Rect
                            x={revenueBarX}
                            y={getYPosition(revenueValues[i])}
                            width={barWidth}
                            height={revenueHeight}
                            fill="#A5D8DD"
                        />

                        <Rect
                            x={purchaseBarX}
                            y={getYPosition(purchaseValues[i])}
                            width={barWidth}
                            height={purchaseHeight}
                            fill="#2D7F8A"
                        />

                        <SvgText
                            x={groupX}
                            y={height - padding.bottom + 15}
                            textAnchor="middle"
                            style={{ fontSize: "11px" }}
                            fill="#666"
                        >
                            {year.toString()}
                        </SvgText>
                    </G>
                );
            })}

            <Circle cx={legendX} cy={legendY} r="4" fill="#A5D8DD" />
            <SvgText x={legendX + 10} y={legendY + 4} style={{ fontSize: "11px" }} fill="#666">
                Revenues
            </SvgText>

            <Circle cx={legendX + 90} cy={legendY} r="4" fill="#2D7F8A" />
            <SvgText x={legendX + 100} y={legendY + 4} style={{ fontSize: "11px" }} fill="#666">
                Expenses
            </SvgText>
        </Svg>
    );
}
