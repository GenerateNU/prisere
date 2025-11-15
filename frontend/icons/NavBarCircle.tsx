import React from "react";

type IconCircleProps = {
    size?: number;
    icon: React.ReactNode; // Accepts JSX or a React component
    bgColor?: string;
};

const IconCircle = ({ size = 23, icon, bgColor = "white" }: IconCircleProps) => {
    return (
        <div
            style={{
                width: size,
                height: size,
                borderRadius: "50%",
                background: bgColor,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 2px #ccc",
            }}
        >
            {icon}
        </div>
    );
};

export default IconCircle;
