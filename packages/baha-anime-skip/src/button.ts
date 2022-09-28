export const button = create_button();

export function create_button(): HTMLButtonElement {
    const button = document.createElement("button");

    Object.assign(button.style, {
        opacity: "0",
        transition: "opacity 0.3s",
        position: "absolute",
        bottom: "50px",
        right: "0px",
        margin: "20px",
        width: "120px",
        height: "40px",
        border: "1px solid lightgray",
        borderRadius: "4px",
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        color: "white",
        fontSize: "16px",
        zIndex: "9",
        justifyContent: "center",
        alignItems: "center",
        cursor: "pointer",
        pointerEvents: "auto",
        overflow: "hidden",
    } as CSSStyleDeclaration);

    return button;
}
