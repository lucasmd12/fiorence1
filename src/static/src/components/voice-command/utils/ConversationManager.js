
export const addToConversation = (setConversation, sender, message) => {
  setConversation(prev => [...prev, { sender, message, timestamp: new Date() }]);
};

export const resetConversationState = (setConversation, setCurrentTransaction, setMissingFields, setIsInConversation, setTranscript, setConfirmation, setError, setSuccess) => {
  setConversation([]);
  setCurrentTransaction({});
  setMissingFields([]);
  setIsInConversation(false);
  setTranscript("");
  setConfirmation(null);
  setError("");
  setSuccess("");
};

