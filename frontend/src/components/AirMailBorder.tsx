type LetterOutlineProps = {
  children: React.ReactNode;
  strokeWidth?: number;
  className?: string;
  paperClassName?: string;
};

export const LetterOutline = ({
  children,
  strokeWidth = 12,
  className = "",
  paperClassName = "",
}: LetterOutlineProps) => {
  const red = "#F45D52";
  const white = "#FEE4C2";
  const blue = "#666CA3";

  const stripeWidth = 15;

  const background = `repeating-linear-gradient(
    135deg,
    ${red} 0px,
    ${red} ${stripeWidth}px,
    ${white} ${stripeWidth}px,
    ${white} ${stripeWidth * 2}px,
    ${blue} ${stripeWidth * 2}px,
    ${blue} ${stripeWidth * 3}px
  )`;

  return (
    <div
      className={`relative rounded-md shadow-xl ${className}`}
      style={{
        padding: strokeWidth,
        background,
      }}
    >
      <div
        className={`relative bg-[var(--paper-bg)] rounded-md ${paperClassName}`}
      >
        {children}
      </div>
    </div>
  );
};