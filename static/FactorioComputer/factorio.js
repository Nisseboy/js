function programMemory(w, h, mem) {
	let entities = [];

	for (let i = 0; i < w * h; i++) {
		let x = i % w;
		let y = Math.floor(i / h);
		entities.push({
			entity_number: i * 3 + 1,
			name: "arithmetic-combinator",
			position: { x: x * 2 + 1 - 10.5, y: y * 4 + 0 - 37 },
			control_behavior: {
				arithmetic_conditions: {
					first_signal: { type: "item", name: "express-transport-belt" },
					second_signal: { type: "item", name: "landfill" },
					operation: "*",
					output_signal: { type: "item", name: "express-transport-belt" },
				},
			},
			connections: {
				1: {
					red: [
						{ entity_id: i * 3 + 3 },
						{ entity_id: i * 3 + 2, circuit_id: 2 },
					],
				},
				2: {
					red: [
						{ entity_id: i * 3 + 1 + (x == w - 1 ? w * 3 : 3), circuit_id: 2 },
					],
				},
			},
		});
		entities.push({
			entity_number: i * 3 + 2,
			name: "decider-combinator",
			position: { x: x * 2 + 1 - 10.5, y: y * 4 + 2 - 37 },
			control_behavior: {
				decider_conditions: {
					first_signal: { type: "virtual", name: "signal-C" },
					output_signal: { type: "item", name: "landfill" },
					constant: i,
					copy_count_from_input: false,
					comparator: "=",
				},
			},
			connections: {
				1: {
					red: [
						{ entity_id: i * 3 + 2 + (x == w - 1 ? w * 3 : 3), circuit_id: 1 },
					],
				},
				2: {
					red: [{ entity_id: i * 3 + 1, circuit_id: 1 }],
				},
			},
		});
		entities.push({
			entity_number: i * 3 + 3,
			name: "constant-combinator",
			position: { x: x * 2 + 0 - 10.5, y: y * 4 + 2 - 36.5 },
			control_behavior: {
				filters: [
					{
						count: mem[i] || 0,
						index: 1,
						signal: { type: "item", name: "express-transport-belt" },
					},
				],
			},
			connections: {
				1: {
					red: [{ entity_id: i * 3 + 1, circuit_id: 1 }],
				},
			},
		});
	}

	let bp = {
		blueprint: {
			icons: [
				{
					signal: {
						type: "item",
						name: "arithmetic-combinator",
					},
					index: 1,
				},
				{
					signal: {
						type: "item",
						name: "wooden-chest",
					},
					index: 2,
				},
			],
			entities: entities,
			item: "blueprint",
			label: "sexum",
			version: 281479275937792,
		},
	};

	return encodeBlueprint(JSON.stringify(bp));
}

function decodeBlueprint(str) {
	let encoded = atob(str.slice(1));

	let chars = encoded.split("").map(function (x) {
		return x.charCodeAt(0);
	});
	let bin = new Uint8Array(chars);

	let decoded = String.fromCharCode(...pako.inflate(bin));

	return decoded;
}
function encodeBlueprint(str) {
	let decoded = str.replace(/\s/g, "");
	decoded = new TextEncoder("utf-8").encode(decoded);

	return "0" + Base64.encodeU(pako.deflate(decoded, { level: 9 }));
}
