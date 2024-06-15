output = "";
list = $0;
for (let i = 0; i < list.children.length; i++) {
	let row = list.children[i].children[0].children[1].children[1];
	let author = row.children[1].innerText;
	if (author == "E") author = row.children[2].innerText;
	output += `${i + 1}: ${row.children[0].innerText} - ${author}\n`;
}
console.log(output);