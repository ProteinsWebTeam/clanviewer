import ClanViewer from '../lib/index';
import data from './example.json';

const rootDiv = document.getElementById('container');
const instance = new ClanViewer({element: rootDiv, directional: true});

instance.paint(data);


