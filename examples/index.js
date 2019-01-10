import ClanViewer from '../lib/index';
import data from './example.json';

const rootDiv = document.getElementById('container');
const instance = new ClanViewer({element: rootDiv, directional: true});

instance.paint(data);

const clearB = document.getElementById('clear-button');
const reloadB = document.getElementById('reload-button');

clearB.addEventListener('click', ()=>instance.clear());
reloadB.addEventListener('click', ()=>instance.paint(data));
