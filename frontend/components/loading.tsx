export default function Loading({ lines = 6 }) {
    const widths = ["w-full", "w-5/6", "w-4/6"];
    return (
        <div className="flex flex-col space-y-3">
            {Array.from({ length: lines }).map((_, index) => {
                const width = widths[index % widths.length];
                return <div key={index} className={`h-5 bg-gray-200 rounded-full animate-pulse ${width}`} />;
            })}
        </div>
    );
}

export function LargeLoading() {
    return (
        <div className="w-full flex h-full flex-col justify-between">
            <div className="space-y-3">
                <div className="h-5 bg-gray-200 rounded-full animate-pulse"></div>
                <div className="h-5 bg-gray-200 rounded-full animate-pulse w-5/6"></div>
                <div className="h-5 bg-gray-200 rounded-full animate-pulse w-4/6"></div>
            </div>

            <div className="flex-1"></div>

            <div className="flex gap-3">
                <div
                    style={{ height: "20px", width: "180px", backgroundColor: "#e5e7eb" }}
                    className="rounded-full animate-pulse"
                ></div>
                <div
                    style={{ height: "20px", width: "180px", backgroundColor: "#e5e7eb" }}
                    className="rounded-full animate-pulse"
                ></div>
            </div>
        </div>
    );
}
