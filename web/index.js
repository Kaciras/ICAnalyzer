import * as Canvas from "./canvas.js";

// 基于准备好的dom，初始化echarts实例
const myChart = echarts.init(document.getElementById('metrics'), null, { renderer: 'svg' });

// 指定图表的配置项和数据
const option = {
	title: {
		text: 'ECharts 入门示例'
	},
	tooltip: {},
	legend: {
		data: ['销量']
	},
	xAxis: {
		data: ["衬衫", "羊毛衫", "雪纺衫", "裤子", "高跟鞋", "袜子"]
	},
	yAxis: {},
	series: [{
		name: '销量',
		type: 'line',
		data: [5, 20, 36, 10, 10, 20]
	}]
};

async function drawChart(name) {
	const response = await fetch(`../data/${name}/Quality/metrics.csv`);
	(await response.text()).split("\n")
}

// 使用刚指定的配置项和数据显示图表。
myChart.setOption(option);

function loadImageData(url) {
	const img = document.createElement("img");
	img.src = url;
	return new Promise((resolve, reject) => {
		img.onerror = reject;
		img.onload = () => resolve(img);
	});
}


async function loadDiffs(name, type, count) {
	const diffs = [];
	for (let i = 0; i < count; i++) {
		diffs.push(await loadImageData(`../data/${name}/${type}/${i}.png`));
	}
	return diffs;
}

async function load(name) {
	const parent = document.getElementById("blend");
	parent.style = `background-image: url("../data/${name}/image.png")`;

	const diffs = await loadDiffs(name, "Quality", 80);
	// await drawChart(name);

	function show(image, i) {
		Canvas.show(image);
		document.getElementById("diff").src = `../data/${name}/Quality/${i}.png`;
	}

	document.getElementById("range").oninput = (event) => {
		show(diffs[event.target.valueAsNumber], event.target.valueAsNumber);
	};

	document.getElementById("range").value = 0;
	show(diffs[0], 0);
}

load("6f6a94d94f9eb1a25faaa68ea3f8565ad09a80b4458bcdbb6bea9ed95f5a3df0");