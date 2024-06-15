/*
Immediate: 11000000

Arithmetic: **0 +
add: 00000
sub: 00001
mlt: 00010
div: 00011
shl: 00100
shr: 00101

Jumps: **1 +
jeq: 00000
jnq: 00001
jmg: 00010
jge: 00011
jml: 00100
jle: 00101
jmp: 00110
*/
let code = `
start: 
  add #$ff #0 0
`.split("\n");

let memory = [];

let index = 0;
let labels = {};

for (let i in code) {
	let line = code[i].split(" ");

	for (let j = 0; j < line.length; j++) {
		let text = line[j];
		if (!text) {
			line.splice(j, 1);
			j--;
		}
	}
	if (!line[0]) continue;

	if (line[0][line[0].length - 1] == ":") {
		labels[line[0].slice(0, -1)] = index;
		continue;
	}
	index++;

	let res = convertLine(
		line[0],
		parseValue(line[1]),
		parseValue(line[2]),
		parseValue(line[3])
	);

	let val = bytes8to32(res[0], res[1], res[2], res[3]);
	memory[index] = val;

	console.log(res);
}
console.log(labels);

console.log(programMemory(16, 16, memory));

function bytes8to32(a, b, c, d) {
	return (a << 24) + (b << 16) + (c << 8) + d;
}

function parseValue(value) {
	let immediate = value[0] == "#";
	let sign = value[immediate * 1];

	let ending = value.slice(immediate + (sign == "%" || sign == "$"));
	let val = 0;

	let jump = false;

	if (sign == "%") {
		val = parseInt(ending, 2);
	} else if (sign == "$") {
		val = parseInt(ending, 16);
	} else if (parseInt(sign) != undefined) {
		val = parseInt(ending);
	} else {
		val = ending;
		jump = true;
	}

	return {
		imm: immediate,
		jmp: jump,
		val: val,
	};
}

function convertLine(a1, a2, a3, a4) {
	switch (a1.toLowerCase()) {
		case "add":
			return [(a2.imm << 7) + (a3.imm << 6) + 0b00000, a2.val, a3.val, a4.val];
	}
}
