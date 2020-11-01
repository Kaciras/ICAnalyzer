import React, { useEffect, useState } from "react";
import echarts, { ECharts } from "echarts";
import { InputImage } from "./App";
import Styles from "./Chart.scss";
import { ConvertOutput } from "../encoding";
import Series = echarts.EChartOption.Series;
import YAxis = echarts.EChartOption.YAxis;

export interface ChartProps {
	original?: InputImage;
	index: number;
	outputs: ConvertOutput[];
}

export default function Chart(props: ChartProps) {
	const { original, outputs, index } = props;
	const [chart, setChart] = useState<ECharts>();

	function refreshEcharts(chart: ECharts) {
		const type = "line"; // TODO

		const legends: string[] = [];
		const yAxis: YAxis[] = [];
		const series: Series[] = [];

		let index = 0;

		function tryAddSeries(name: string, func: (output: ConvertOutput) => number | undefined) {
			if (func(outputs[0]) === undefined) {
				return;
			}
			const data = outputs.map(func);
			legends.push(name);
			yAxis.push({ type: "value" });
			series.push({ name, type, data, yAxisIndex: index++ });
		}

		tryAddSeries("Compression Ratio %", v => v.buffer.byteLength / original!.file.size * 100);
		tryAddSeries("Encode Time (ms)", v => v.time);
		tryAddSeries("SSIM", v => v.metrics.SSIM);
		tryAddSeries("PSNR (db)", v => v.metrics.PSNR);
		tryAddSeries("Butteraugli Source", v => v.metrics.butteraugli?.source);

		chart?.setOption({
			tooltip: {
				trigger: "axis",
				showContent: false,
				triggerOn: "none",
			},
			legend: {
				data: legends,
			},
			xAxis: {
				data: outputs.map((_, i) => i),
			},
			yAxis,
			series,
			backgroundColor: "transparent",
		});
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
					return `${name}: ${itemValue[0].data[index].toFixed(2)}`;
				},
				data: chart?.getOption().legend?.data,
			},
		});
	});

	return (
		<section className={Styles.container}>
			<div className={Styles.chart} ref={initEcharts}/>
		</section>
	);
}
