import { useEffect, useState } from "react";
import Highcharts, { Options, SeriesLineOptions, YAxisOptions } from "highcharts";
import Export from "highcharts/modules/exporting";
import ExportOffline from "highcharts/modules/offline-exporting";
import { ConvertOutput } from "../encode";
import { InputImage } from "./index";
import "../highcharts.scss";
import styles from "./Chart.scss";

Export(Highcharts);
ExportOffline(Highcharts);

function toSeries(original: InputImage, outputs: ConvertOutput[]) {
	const series: SeriesLineOptions[] = [];
	let index = 0;

	function tryAddSeries(name: string, fn: (output: ConvertOutput) => number | undefined) {
		if (fn(outputs[0]) === undefined) {
			return;
		}
		const data = outputs.map(fn) as number[];
		series.push({ name, type: "line", data, yAxis: index++ });
	}

	const divisor = original.file.size / 100;
	tryAddSeries("Compression Ratio %", v => v.buffer.byteLength / divisor);
	tryAddSeries("Encode Time (ms)", v => v.time);
	tryAddSeries("SSIM", v => v.metrics.SSIM);
	tryAddSeries("PSNR (db)", v => v.metrics.PSNR);
	tryAddSeries("Butteraugli Source", v => v.metrics.butteraugli?.source);

	return series;
}

function onChartCreated(chart: Highcharts.Chart) {

	function handleMouseover(i: number) {
		chart.yAxis.forEach((axis, j) => {
			if (j === 0) return;
			axis.update({ visible: i === j });
		});
	}

	chart.legend.allItems.forEach((s, i) => {
		if (i === 0) return;
		s.onMouseOver = () => handleMouseover(i);
	});
	chart.series.forEach((s, i) => {
		if (i === 0) return;
		(s as any).legendItem.on("mouseover", () => handleMouseover(i));
	});
}

export interface ChartProps {
	original: InputImage;
	index: number;
	values: string[];
	outputs: ConvertOutput[];
}

export default function Chart(props: ChartProps) {
	const { original, outputs, index, values } = props;

	const [chart, setChart] = useState<Highcharts.Chart>();

	function initEcharts(el: HTMLDivElement | null) {
		if (!el || chart) {
			return;
		}
		const series = toSeries(original, outputs);

		const yAxis: YAxisOptions[] = series.map(s => ({
			title: {
				text: s.name,
			},
			visible: false,
			opposite: true,
		}));

		const [left, right] = yAxis;
		left.visible = true;
		left.opposite = false;
		if (right) {
			right.visible = true;
		}

		const options: Options = {
			chart: {
				animation: false,
				styledMode: true,
			},
			title: {
				text: "",
			},
			tooltip: {
				borderRadius: 0,
			},
			legend: {
				verticalAlign: "top",
			},
			xAxis: {
				categories: values,
			},
			exporting: {
				buttons: {
					contextButton: {
						height: 32,
						width: 35,
						symbolSize: 16,
						symbolX: 18,
						symbolY: 16,
					},
				},
				chartOptions: {
					chart: {
						className: "exporting_chart_class",
					},
				},
			},
			yAxis,
			series,
		};
		setChart(Highcharts.chart(el, options, onChartCreated));
	}

	useEffect(() => {
		if (!chart) {
			return;
		}
		const series = toSeries(original, outputs);
		chart.series.forEach((s, i) => s.setData(series[i].data!));
		chart.xAxis[0].setCategories(values);
	}, [outputs]);

	useEffect(() => {
		if (!chart) {
			return;
		}
		const xAxis = chart.xAxis[0];
		xAxis.removePlotLine("MarkLine");
		xAxis.addPlotLine({
			id: "MarkLine",
			value: index,
			dashStyle: "Dash",
		});
		chart.legend.update({
			labelFormatter() {
				const { name, yData } = this as any;
				const v = yData[index].toFixed(2);
				return `<span>${name}: </span><b>${v}<br/>`;
			},
		});
	});

	return (
		<section className={styles.container}>
			<div className={styles.chart} ref={initEcharts}/>
		</section>
	);
}
