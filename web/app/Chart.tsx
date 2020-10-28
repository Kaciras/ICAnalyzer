import React, { useEffect, useState } from "react";
import echarts, { EChartOption, ECharts } from "echarts";
import Styles from "./Chart.scss";
import { ConvertOutput } from "../encoding";

interface Props {
	original?: File;
	index: number;
	outputs: ConvertOutput[];
}

export default function Chart(props: Props) {
	const { original, outputs, index } = props;
	const [chart, setChart] = useState<ECharts>();

	function refreshEcharts(chart: ECharts) {
		const type = "line";
		const series = [
			{
				name: "Compression Ratio %",
				type,
				data: outputs.map(v => v.buffer.byteLength / original!.size),
				yAxisIndex: 0,
			},
			{
				name: "Encode Time (ms)",
				type,
				data: outputs.map(v => v.time),
				yAxisIndex: 1,
			},
			{
				name: "PSNR (db)",
				type,
				data: outputs.map(v => v.metrics.PSNR),
				yAxisIndex: 2,
			},
		];
		const option: EChartOption = {
			// title: {
			// 	text: "Quality (-q)",
			// },
			tooltip: {
				trigger: "axis",
				showContent: false,
				triggerOn: "none",
			},
			legend: {
				data: ["Compression Ratio %", "Encode Time (ms)", "PSNR (db)"],
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
				{
					type: "value",
					offset: 40,
				},
			],
			backgroundColor: "transparent",
			series,
		};

		const { SSIM, PSNR, butteraugli } = outputs[0].metrics;
		if (SSIM) {
			series.push({
				name: "SSIM",
				type,
				data: outputs.map(v => v.metrics.SSIM),
				yAxisIndex: 2,
			});
		}

		chart?.setOption(option);
	}

	function initEcharts(el: HTMLDivElement | null) {
		if (!el) {
			return;
		}
		if (!chart) {
			const newChart = echarts.init(el, "dark", { renderer: "svg" });
			setChart(newChart);
			refreshEcharts(newChart);
		}
	}

	// useEffect(() => chart && refreshEcharts(chart), [outputs]);

	useEffect(() => {
		chart?.dispatchAction({ type: "showTip", seriesIndex: 0, dataIndex: index });
		const series = chart?.getOption().series as any;
		chart?.setOption({
			legend: {
				formatter: (name) => {
					const itemValue = series.filter((item: any) => item.name === name);
					return `${name}: ${itemValue[0].data[index]}`;
				},
				data: ["Compression Ratio %", "Encode Time (ms)", "PSNR (db)"],
			},
		});
	});

	return (
		<section className={Styles.container}>
			<div className={Styles.chart} ref={initEcharts}/>
		</section>
	);
}
