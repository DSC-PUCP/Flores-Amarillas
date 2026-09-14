import NavButton from './NavButton';

interface NextButtonProps {
  onClick?: () => void;
  label?: string;
  className?: string;
  id?: string;
}

export default function NextButton({ onClick, label = 'Siguiente', className = '', id, ...motionProps }: NextButtonProps & import('framer-motion').HTMLMotionProps<"button">) {
  if (!onClick) return null;

  return (
    <NavButton
      id={id}
      direction="next"
      label={label}
      onClick={onClick}
      className={className}
      {...motionProps}
    />
  );
}
