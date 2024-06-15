let nn = new brain.NeuralNetwork;

let data = [];
for (let i = 0; i < 1000; i++) {
  let values = getValues();
  data.push({input: values, output: [trueFunc(...values)+0]});
}

nn.train(data);

console.log("--------------");

for (let i = 0; i < 10; i++) {
  test(...getValues());
}

function getValues() {
  return [
    Math.random(),
    Math.random(),
    Math.random(),
    Math.random(),
    Math.random(),
  ];
}
function trueFunc(a,b,c,d,e) {
  return (a + b * c + d * e) > 1;
}

function test(a,b,c,d,e) {
  let tru = trueFunc(a,b,c,d,e);
  let result = nn.run([a,b,c,d,e]);
  console.log(tru == (result >= 0.5));
}