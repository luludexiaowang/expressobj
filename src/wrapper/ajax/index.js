/* eslint-disable import/prefer-default-export */
export function search(query) {
  return new Promise(resolve => {
    setTimeout(() => {
      const result = [];
      for (let i = 0; i < 5; i += 1) {
        result.push(query + i);
      }
      resolve(result);
    }, 100);
  });
}
