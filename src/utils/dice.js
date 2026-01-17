export function rollDice(num = 5, sides = 6) {
  return Array.from({ length: num }, () => Math.floor(Math.random() * sides) + 1);
}
