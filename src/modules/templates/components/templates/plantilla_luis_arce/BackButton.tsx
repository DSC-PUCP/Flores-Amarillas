import NavButton from './NavButton';

interface BackButtonProps {
  onClick?: () => void;
}

export default function BackButton({ onClick }: BackButtonProps) {
  if (!onClick) return null;

  return (
    <NavButton
      direction="back"
      label="Volver"
      onClick={onClick}
      className="absolute bottom-6 left-6 md:bottom-8 md:left-8 z-[70]"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ delay: 0.5 }}
    />
  );
}
