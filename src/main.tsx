/* @refresh reload */
import { render } from 'solid-js/web';
import App from './App';

import { defineLegacyEnvelope } from './components/legacy/envelope/EnvelopeSwitcher';
import './components/legacy/styles/audio-components.css';
import './styles/themes.css';
import './style.css';
import './utils/pwa-utils/updateSW';

defineLegacyEnvelope(); // Define the remaining vanilla controls

const root = document.getElementById('root');

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?',
  );
}

render(() => <App />, root!);
