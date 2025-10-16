
type NavBarCircleProps = {
    size?: number;
};

const NavBarCircle = (props: NavBarCircleProps) => {
    const { size = 23 } = props;
    return (
        <svg className="flex-none" width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx={size / 2} cy={size / 2} r={size / 2} fill="#8D8D8D" />
        </svg>
    );
}

export default NavBarCircle;