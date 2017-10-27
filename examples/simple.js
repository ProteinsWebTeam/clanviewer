import ClanViewer from '../lib/index';
import data from './example2.json';

const rootDiv = document.getElementById('container');
const instance = new ClanViewer({element: rootDiv, directional: true});

instance.paint(data);


