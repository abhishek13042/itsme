/**
 * JARVIS Voice Interface — Web Speech API
 * Pure utility for text-to-speech output.
 */

export function speak(text) {
  if (typeof window === 'undefined' || !window.speechSynthesis) {
    console.warn('Speech synthesis not supported in this browser.');
    return;
  }

  // Cancel any currently ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.92;
  utterance.pitch = 0.85;
  utterance.volume = 1;

  const voices = window.speechSynthesis.getVoices();

  const findPreferredVoice = (voiceList) => {
    return voiceList.find(v => v.name.includes('Google UK English Male'))
      || voiceList.find(v => v.name.includes('Google UK English'))
      || voiceList.find(v => v.lang === 'en-GB')
      || voiceList.find(v => v.lang.startsWith('en'))
      || voiceList[0];
  };

  if (voices.length === 0) {
    window.speechSynthesis.onvoiceschanged = () => {
      const v = window.speechSynthesis.getVoices();
      const preferred = v.find(x => x.name.includes('Google UK English Male')) || v.find(x => x.lang.startsWith('en')) || v[0];
      if (preferred) utterance.voice = preferred;
      window.speechSynthesis.speak(utterance);
      // Clean up the handler to prevent multiple triggers
      window.speechSynthesis.onvoiceschanged = null;
    };
  } else {
    const preferred = findPreferredVoice(voices);
    if (preferred) utterance.voice = preferred;
    window.speechSynthesis.speak(utterance);
  }

  utterance.onerror = (e) => console.error('Speech error:', e);
}

export function stopSpeaking() {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}
