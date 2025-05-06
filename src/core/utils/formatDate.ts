/* eslint-disable @typescript-eslint/no-unused-vars */
export const formatDate = (dateString: string) => {
  try {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return "Hoje";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Ontem";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Amanhã";
    }

    return new Intl.DateTimeFormat("pt-BR").format(date);
  } catch (error) {
    return dateString;
  }
};

export const isExpired = (dateString: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const date = new Date(dateString);
  date.setHours(0, 0, 0, 0);
  return date < today && date.getTime() !== today.getTime();
};
