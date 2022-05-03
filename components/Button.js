function Button({ variant = "primary", onClick, children, disabled }) {
  let style = "";
  if (variant === "primary") {
    style += `bg-gradient-to-r from-green-200 to-pink-200`;
  } else if (variant === "secondary") {
    style += `border-2 border-green-200`;
  }

  return (
    <button
      className={`rounded-lg p-4 ${style} w-full sm:w-auto ${
        disabled ? "cursor-not-allowed opacity-50" : ""
      }`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export default Button;
