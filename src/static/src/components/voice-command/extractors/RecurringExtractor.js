export const extractRecurring = (command) => {
  const recurringMatch = command.match(/todo dia (\d{1,2})|sempre no dia (\d{1,2})/i);
  if (recurringMatch) {
    return {
      is_recurring: true,
      recurring_day: parseInt(recurringMatch[1] || recurringMatch[2], 10),
    };
  }
  return { is_recurring: false, recurring_day: null };
};
