const result = [];
const ROW = 8;
const COL = 8;
for (let i = 1; i <= ROW; i += 1) {
  const row = [];
  result.push(row);
  for (let j = 1; j <= COL; j += 1) {
    const value = `${i}x${j}`;
    row.push({ label: value, value });
  }
}
export default result;
