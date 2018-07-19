const web = [
  '#525975',
  '#9094A3',
  '#154191',
  '#F23737',
  '#F59A26',
  '#37922B',
];
const app = [
  '#333333',
  '#cccccc',
  '#154191',
  '#F23737',
  '#F59A26',
  '#37922B',
];
const result = window.inApp ? app : web;

export default result;
export const defaultSelectedColor = result[0];
const styleDom = document.createElement('style');
styleDom.innerHTML = `.ql-container{color:${defaultSelectedColor}!important;}`;
document.getElementsByTagName('title')[0].appendChild(styleDom);
