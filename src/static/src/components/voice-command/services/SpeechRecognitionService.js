
export const initializeSpeechRecognition = (onResult, onError, onStart, onEnd) => {
  if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
    return null;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = "pt-BR";
  
  recognition.onstart = onStart;
  recognition.onresult = onResult;
  recognition.onerror = onError;
  recognition.onend = onEnd;

  return recognition;
};

export const startRecognition = (recognition) => {
  if (recognition) {
    recognition.start();
  }
};

export const stopRecognition = (recognition) => {
  if (recognition) {
    recognition.stop();
  }
};

