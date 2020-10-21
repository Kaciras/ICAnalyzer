import React, { useEffect, useState } from "react";
import echarts, { EChartOption, ECharts } from "echarts";
import Styles from "./Chart.scss";
import { ConvertOutput } from "../encoding";

interface Props {
	original?: File;
	outputs: ConvertOutput[];
}

export default function Chart(props: Props) {
	const { original, outputs } = props;
	const [chart, setChart] = useState<ECharts>();

	function initEchart(el: HTMLDivElement | null) {
		if (!el) {
			return;
		}
		setChart(echarts.init(el, "dark", { renderer: "svg" }));
	}

	useEffect(() => {
		const option: EChartOption = {
			title: {
				text: "Quality (-q)",
			},
			tooltip: {
				trigger: "axis",

			},
			legend: {
				data: ["Compression Ratio %", "PSNR (db)"],
			},
			xAxis: {
				data: outputs.map((_, i) => i),
			},
			yAxis: [
				{
					type: "value",
				},
				{
					type: "value",
				},
			],
			backgroundColor: "transparent",
			series: [
				{
					name: "Compression Ratio %",
					type: "line",
					data: outputs.map(v => v.buffer.byteLength / original!.size),
					yAxisIndex: 0,
				},
				{
					name: "PSNR (db)",
					type: "line",
					data: outputs.map(v => v.metrics.PSNR),
					yAxisIndex: 1,
				},
			],
		};


		chart?.setOption(option);
	});

	return (
		<section className={Styles.container}>
			<div className={Styles.chart} ref={initEchart}/>
		</section>
	);
}
