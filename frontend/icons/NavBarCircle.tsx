type NavBarCircleProps = {
    size?: number;
};

import bellPng from "./notification-bell.svg";

const NavBarCircle = (props: NavBarCircleProps) => {
    const { size = 23 } = props;
    const bellSize = Math.floor(size * 0.6); // Bell is 60% of the circle

    return (
        <div
            style={{
                width: size,
                height: size,
                borderRadius: "50%",
                background: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 2px #ccc",
            }}
        >
            <img
                src={bellPng.src ?? bellPng}
                alt="Notification Bell"
                width={bellSize}
                height={bellSize}
                style={{ display: "block" }}
            />
        </div>
    );
};

export default NavBarCircle;