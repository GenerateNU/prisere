type CircleProps = {
    size?: number;
    color: string;
};

const Circle = (props: CircleProps) => {
    const { size = 23, color } = props; // <-- add color here

    return (
        <div
            style={{
                width: size,
                height: size,
                borderRadius: "50%",
                background: color, // <-- use color prop
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 0 2px #ccc",
            }}
        ></div>
    );
};

export default Circle;
