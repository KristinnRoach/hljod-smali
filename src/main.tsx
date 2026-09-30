/* @refresh reload */
import { render } from 'solid-js/web';
import { configureAudioContext } from '@kidlib/web-audio';
import App from './App';

import './themes.css';
import './style.css';
import '@/lib/updateSW';

// Before render: the output device picker touches the shared context on mount.
configureAudioContext({ sampleRate: 44_100 });

const root = document.getElementById('root');

if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    'Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?',
  );
}

render(() => <App />, root!);
