import { createRoot } from 'react-dom/client';
import { SpringGame } from './src/modules/templates/components/templates/plantilla_giano_feat_leo/components/spring-game';
import './src/modules/templates/components/templates/plantilla_giano_feat_leo/components/spring-welcome.module.css';
createRoot(document.getElementById('root')!).render(<SpringGame recipient="María" />);
