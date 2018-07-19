import Quill from 'quill';
import './index.less';

const Header = Quill.import('formats/header');
Header.tagName = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P', 'DIV'];
Quill.register(Header, true);
