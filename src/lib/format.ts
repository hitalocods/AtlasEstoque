export const money = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export const number = new Intl.NumberFormat("pt-BR", {
  maximumFractionDigits: 2,
});

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function sameDay(value: string, date = new Date()) {
  const current = new Date(value);
  return (
    current.getFullYear() === date.getFullYear() &&
    current.getMonth() === date.getMonth() &&
    current.getDate() === date.getDate()
  );
}

