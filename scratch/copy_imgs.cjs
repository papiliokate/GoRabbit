const fs = require('fs');
const path = require('path');

const srcDir = 'C:\\Users\\papil\\.gemini\\antigravity\\brain\\6ac14225-1f10-491e-b56a-1641d1a786fa';
const dstDir = 'C:\\Users\\papil\\Documents\\GoRabbit\\public';

const filesToCopy = {
  'rabbit_img_1776037980339.png': 'rabbit.png',
  'bear_img_1776037990182.png': 'bear.png',
  'turtle_img_1776038003070.png': 'turtle.png',
  'tree_img_1776038014491.png': 'tree.png',
  'egg_img_1776038035916.png': 'egg.png',
  'lettuce_img_1776038047524.png': 'lettuce.png',
  'warren_img_1776038059967.png': 'warren.png',
  'nest_img_1776038075073.png': 'nest.png',
  'log_img_1776038085610.png': 'log.png',
  'exit_img_1776038097888.png': 'exit.png',
  'skeleton_img_1776038110424.png': 'skeleton.png'
};

for (const [srcName, dstName] of Object.entries(filesToCopy)) {
  fs.copyFileSync(path.join(srcDir, srcName), path.join(dstDir, dstName));
}
console.log('Done copying standard images.');
