const DELIMITER = '_';
const types = {
  EDT: ['FOCUS', 'BLUR'],
  RTE: ['FOCUS', 'BLUR', 'READY', 'ACTIVE_CHANGE'],
  MD: ['READY'],
  TB: ['FOCUS', 'BLUR', 'FOCUS_TRANSFER', 'FORMAT'],
  LINK: ['ADD', 'UPDATE'],
};
const [event] = Object.keys(types).reduce(([result, count], key) => {
  types[key].forEach(sub => {
    result[[key, sub].join(DELIMITER)] = count;
    count += 1;
  });
  return [result, count];
}, [{}, 0]);
export default event;
