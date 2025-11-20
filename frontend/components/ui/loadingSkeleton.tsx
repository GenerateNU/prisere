interface LoadingSkeletonProps {
    height: string;
    width: string;
}

export const LoadingSkeleton = ({ height, width }: LoadingSkeletonProps) => {
    return <div className="animate-pulse h-${height} bg-gray-200 rounded w-${width}"></div>;
};
