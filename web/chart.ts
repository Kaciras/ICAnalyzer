import echarts from "echarts";

const mountEl = document.getElementById("metrics");

// 基于准备好的dom，初始化echarts实例
const myChart = echarts.init(mountEl as HTMLDivElement, { renderer: "svg" });

// 指定图表的配置项和数据
const option = {
	title: {
		text: "ECharts 入门示例"
	},
	tooltip: {},
	legend: {
		data: ["销量"]
	},
	xAxis: {
		data: ["衬衫", "羊毛衫", "雪纺衫", "裤子", "高跟鞋", "袜子"]
	},
	yAxis: {},
	series: [{
		name: "销量",
		type: "line",
		data: [5, 20, 36, 10, 10, 20]
	}]
};

async function drawChart(metrics: any) {
	// 使用刚指定的配置项和数据显示图表。
	myChart.setOption(option);
}
