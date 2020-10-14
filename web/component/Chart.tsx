import React, { useEffect, useState } from "react";
import echarts, { ECharts } from "echarts";

interface Props {
	options: any;
}

// setChartOptions({
// 	title: {
// 		text: "Quality (-q)",
// 	},
// 	tooltip: {
// 		trigger: "axis",
// 	},
// 	legend: {
// 		data: ["Compression Ratio"],
// 	},
// 	xAxis: {
// 		data: encodedFiles.map((_, i) => i),
// 	},
// 	yAxis: {},
// 	series: [{
// 		name: "Compression Ratio %",
// 		type: "line",
// 		data: encodedFiles.map(({ length }) => length / file.size * 100),
// 	}],
// });

export default function Chart(props: Props) {
	const { options } = props;
	const [chart, setChart] = useState<ECharts>();

	function initEchart(el: HTMLDivElement | null) {
		if (!el) {
			return;
		}
		setChart(echarts.init(el, { renderer: "svg" }));
	}

	useEffect(() => chart?.setOption(options), [options]);

	return <div id="metrics" ref={initEchart}/>;
}
