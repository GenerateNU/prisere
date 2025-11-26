export default function Loading({ lines = 6 }) {
    const widths = ["w-full", "w-5/6", "w-4/6"];
    return (
        <div className="flex flex-col space-y-3">
            {Array.from({ length: lines }).map((_, index) => {
                const width = widths[index % widths.length];
                return <div key={index} className={`h-4 bg-gray-200 rounded animate-pulse ${width}`} />;
            })}
        </div>
    );
}
