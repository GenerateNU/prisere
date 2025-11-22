interface RiskPillFactoryProps {
    riskLevel: string;
}
export const RiskPillFactory = ({ riskLevel }: RiskPillFactoryProps) => {
    if (riskLevel.toUpperCase().includes("HIGH")) {
        return (
            <div className="p-2 rounded bg-red-100">
                <p className="text-xs text-fuchsia font-bold">{riskLevel}</p>
            </div>
        );
    } else if (riskLevel.toUpperCase().includes("MODERATE")) {
        return (
            <div className="p-2 rounded bg-amber-200 ">
                <p className="text-xs text-stone-600 font-bold">{riskLevel}</p>
            </div>
        );
    } else if (riskLevel.toUpperCase().includes("LOW")) {
        return (
            <div className="p-2 rounded bg-light-teal">
                <p className="text-xs text-teal font-bold">{riskLevel}</p>
            </div>
        );
    } else {
        return (
            <div className="p-2 rounded bg-slate-200">
                <p className="text-xs text-slate-500 font-bold">{riskLevel}</p>
            </div>
        );
    }
};
