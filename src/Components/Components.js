export const InputWithLabel = ({ 
    label, 
    error,
    children, 
    isInline = false, 
    labelWidth = "auto",
    divStyle = {},
    reqMark = false, 
    labelColor="var(--inputLabelColor)",
}) => {
    
    return (
        <div
            style={{
                display: "inline-flex",
                flexDirection: isInline ? "row" : "column",
                alignItems: isInline ? "center" : "flex-start",
                ...divStyle
            }}
        >
            <label
                style={{
                    color: labelColor,
                    fontWeight: "bold",
                    marginRight: "10px",
                    width: labelWidth,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                }}
            >
                {label} {reqMark && <span style={{color: "red", marginLeft: '2px'}}>*</span>}
            </label>
            {children}
            <label
                style={{
                    color: "red",
                    marginRight: "8px",
                    display: "inline-block",
                }}
            >
                {error?.errors?.[0]?.msg}
            </label>
        </div>
    );
};
