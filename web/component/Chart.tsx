import React, { useEffect, useState } from "react";
import echarts, { EChartOption, ECharts } from "echarts";

interface Props {
	options: EChartOption
}

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
