import {ai} from './src/ai/genkit';

async function main() {
  console.log('Genkit initialized successfully');
  try {
     const flow = ai.defineFlow({ name: 'testFlow' }, async () => 'ok');
     console.log('Flow defined');
  } catch (e) {
      console.error('Error defining flow:', e);
  }
}

main().catch(console.error);
