interface RiskPillFactoryProps {
    riskLevel: string;
    highLevelPositive?: boolean;
}
export const RiskPillFactory = ({ riskLevel, highLevelPositive = false }: RiskPillFactoryProps) => {
    const isHigh = riskLevel.toUpperCase().includes("HIGH");
    const isModerate = riskLevel.toUpperCase().includes("MODERATE");
    const isLow = riskLevel.toUpperCase().includes("LOW");

    const getStyles = () => {
        if (isHigh) {
            return highLevelPositive ? "bg-light-teal text-teal" : "bg-red-100 text-fuchsia";
        }
        if (isModerate) {
            return "bg-amber-200 text-stone-600";
        }
        if (isLow) {
            return highLevelPositive ? "bg-red-100 text-fuchsia" : "bg-light-teal text-teal";
        }
        return "bg-slate-200 text-slate-500";
    };

    return (
        <div className={`p-2 rounded ${getStyles().split(" ")[0]}`}>
            <p className={`text-xs font-bold ${getStyles().split(" ")[1]}`}>{riskLevel}</p>
        </div>
    );
};
