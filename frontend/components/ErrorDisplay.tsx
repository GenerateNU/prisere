import { FaExclamation } from "react-icons/fa6";

export default function ErrorDisplay() {
    return (
        <div className="flex flex-1 flex-col items-center justify-center h-full text-center gap-4 z-10 relative">
            <div className="flex w-16 h-16 bg-fuchsia rounded-full items-center justify-center">
                <FaExclamation color="white" size={50} />
            </div>
            <div>
                <h3 className="text-lg font-bold mb-2">Error Fetching Data</h3>
                <p className="text-sm text-gray-600">Please try again later</p>
            </div>
        </div>
    );
}
