const capitalizeTitle = (title: string): string => {
  const lowerCaseWords = [
    "e",
    "para",
    "de",
    "do",
    "da",
    "dos",
    "das",
    "a",
    "o",
    "as",
    "os",
    "com",
    "em",
    "por",
    "no",
    "na",
    "nos",
    "nas",
  ];

  return title
    .split(" ")
    .map((word, index) => {
      if (lowerCaseWords.includes(word.toLowerCase()) && index !== 0) {
        return word.toLowerCase();
      } else {
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      }
    })
    .join(" ");
};

export { capitalizeTitle };
