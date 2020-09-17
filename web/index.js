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
		type: 'bar',
		data: [5, 20, 36, 10, 10, 20]
	}]
};

// 使用刚指定的配置项和数据显示图表。
myChart.setOption(option);

const ctxP = document.getElementById("preview").getContext("2d");
const ctxD = document.getElementById("diff").getContext("2d");

function loadImageData(url) {
	const img = document.createElement("img");
	img.src = url;
	return new Promise((resolve, reject) => {
		img.onerror = reject;
		img.onload = () => resolve(img);
	});
}

async function load(name) {
	const parent = document.getElementById("blend");
	parent.style = `background: url("../data/${name}/image.png")`;

	const diffs = [];
	for (let i = 0; i < 20; i++) {
		diffs.push(await loadImageData(`../data/${name}/Quality/${i}.png`));
	}

	function show(image) {
		ctxP.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight, 0, 0, 600, 400);
		ctxD.drawImage(image, 0, 0, image.naturalWidth, image.naturalHeight, 0, 0, 600, 400);
	}

	document.getElementById("range").oninput = (event) => {
		show(diffs[event.target.valueAsNumber]);
	};

	show(diffs[19]);
}

load("6f6a94d94f9eb1a25faaa68ea3f8565ad09a80b4458bcdbb6bea9ed95f5a3df0");