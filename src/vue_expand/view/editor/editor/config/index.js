import Bridge from '../../../../../wrapper/native';

const bridge = Bridge.getInstance();
const config = {
  color: require('./color').default,
  header: require('./header').default,
  table: require('./table').default,
};
bridge.setData('config', config);

export default config;
