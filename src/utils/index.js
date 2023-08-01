import words from "../words";

export const copyArray = (arr) => {
    return [...arr.map((rows) => [...rows])];
  };
  
  export const getDayOfTheYear = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now - start;
    const oneDay = 1000 * 60 * 60 * 24;
    const day = Math.floor(diff / oneDay);
    //const clampedDay = day + 1;
    const clampedDay = day % words.length;
    return clampedDay;
  };
console.log("Current day of the year:", getDayOfTheYear());
console.log("Corresponding word:", words[getDayOfTheYear()]);

export const getDayKey = () => {
  const d = new Date();
  let year = d.getFullYear();
  return `day-${getDayOfTheYear() +4}-${year}`;
};
 