let loop;
let loopI = 0;
let matrix = [
  [1,0,0,1],
  [1,1,0,0],
  [1,0,1,0]
];

const plusLoop = (i,matrix) => {
  i++;
  if (i === matrix[0].length) i = 0;
  return i;
}
$('#drum').click(() => {
  loop = setInterval(() => {

    if (matrix[0][loopI] === 1) planetSound.play();
    if (matrix[1][loopI] === 1) sunSound.play();
    if (matrix[2][loopI] === 1) noAgeSound.play();

    loopI = plusLoop(loopI, matrix);
  } ,2000);
});

$('#stop').click(() => {
  clearInterval(loop);
});
