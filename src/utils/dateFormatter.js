export const formatDate = (dateString) => {
  const date = new Date(dateString);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  const formattedHours = hours % 12 || 12;
  const formattedMinutes = minutes.toString().padStart(2, "0");

  const dateOptions = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  };

  const formattedDate = date.toLocaleDateString("es-AR", dateOptions);
  return `${formattedDate} - ${formattedHours}:${formattedMinutes} ${ampm}`;
};

export const formatShortDate = (dateString) => {
  const date = new Date(dateString);
  const options = {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  };

  return date.toLocaleDateString("es-AR", options);
};
