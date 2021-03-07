import { useEffect, useState } from "react";
import { ECharts, init } from "echarts";
import Styles from "./Chart.scss";
import { ConvertOutput } from "../encode";
import { InputImage } from "./index";
import Series = echarts.EChartOption.Series;
import YAxis = echarts.EChartOption.YAxis;

function refreshEcharts(chart: ECharts, original: InputImage, outputs: ConvertOutput[]) {
	const type = "line"; // TODO

	const legends: string[] = [];
	const yAxis: YAxis[] = [];
	const series: Series[] = [];

	let index = 0;

	function tryAddSeries(name: string, fn: (output: ConvertOutput) => number | undefined) {
		if (fn(outputs[0]) === undefined) {
			return;
		}
		const data = outputs.map(fn);
		legends.push(name);
		yAxis.push({ type: "value", show: false });
		series.push({ name, type, data, yAxisIndex: index++ });
	}

	const divisor = original.file.size / 100;
	tryAddSeries("Compression Ratio %", v => v.buffer.byteLength / divisor);
	yAxis[0].show = true;

	tryAddSeries("Encode Time (ms)", v => v.time);
	tryAddSeries("SSIM", v => v.metrics.SSIM);
	tryAddSeries("PSNR (db)", v => v.metrics.PSNR);
	tryAddSeries("Butteraugli Source", v => v.metrics.butteraugli?.source);

	chart.setOption({
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

export interface ChartProps {
	original: InputImage;
	index: number;
	outputs: ConvertOutput[];
}

export default function Chart(props: ChartProps) {
	const { original, outputs, index } = props;
	const [chart, setChart] = useState<ECharts>();

	function initEcharts(el: HTMLDivElement | null) {
		if (!el) {
			return;
		}
		if (!chart) {
			const newChart = init(el, "dark", { renderer: "svg" });
			setChart(newChart);
			refreshEcharts(newChart, original, outputs);
		}
	}

	// useEffect(() => chart && refreshEcharts(chart), [outputs]);

	useEffect(() => {
		if (!chart) {
			return;
		}
		chart.dispatchAction({
			type: "showTip",
			seriesIndex: 0,
			dataIndex: index,
		});
		const series = chart.getOption().series as any;
		chart.setOption({
			legend: {
				formatter: (name) => {
					const itemValue = series.filter((item: any) => item.name === name);
					return `${name}: ${itemValue[0].data[index].toFixed(2)}`;
				},
				data: chart.getOption().legend!.data,
			},
		});
	});

	return (
		<section className={Styles.container}>
			<div className={Styles.chart} ref={initEcharts}/>
		</section>
	);
}
