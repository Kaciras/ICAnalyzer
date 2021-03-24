import { useEffect, useState } from "react";
import Highcharts, { Chart, Options, SeriesLineOptions } from "highcharts";
import Export from "highcharts/modules/exporting";
import ExportOffline from "highcharts/modules/offline-exporting";
import { ConvertOutput } from "../encode";
import { InputImage } from "./index";
import styles from "./ChartPanel.scss";

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

function handleMouseover(chart: Chart, i: number) {
	chart.yAxis.forEach((axis, j) => {
		if (j === 0) return;
		axis.update({ visible: i === j });
	});
}

function addSeriesListener(chart: Chart) {
	chart.legend.allItems.forEach((s, i) => {
		if (i === 0) return;
		s.onMouseOver = () => handleMouseover(chart, i);
	});
}

function addLegendListener(chart: Chart) {
	chart.series.forEach((s, i) => {
		if (i === 0) return;
		(s as any).legendItem.on("mouseover", () => handleMouseover(chart, i));
	});
}

export interface ChartProps {
	visible: boolean;
	original: InputImage;
	index: number;
	values: string[];
	outputs: ConvertOutput[];
}

export default function ChartPanel(props: ChartProps) {
	const { visible, original, outputs, index, values } = props;

	const [chart, setChart] = useState<Chart>();

	function initHighcharts(el: HTMLDivElement | null) {
		if (!el || chart) {
			return;
		}
		const series = toSeries(original, outputs);

		const yAxis = series.map(s => ({
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

				// Avoid layout shift on Y axis changes
				width: 420,
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
		setChart(Highcharts.chart(el, options, instance => {
			addSeriesListener(instance);
			addLegendListener(instance);
		}));
	}

	function updateSeriesData(chart: Chart) {
		const series = toSeries(original, outputs);
		chart.xAxis[0].setCategories(values);
		chart.series.forEach((s, i) => s.setData(series[i].data!));
	}

	function updatePlotLine(chart: Chart) {
		const [xAxis] = chart.xAxis;
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
		addLegendListener(chart);
	}

	useEffect(() => chart && updateSeriesData(chart), [outputs]);
	useEffect(() => chart && updatePlotLine(chart));

	// High cost of rendering chart, so keep the element
	const display = visible ? {} : { display: "none" };

	return (
		<section className={styles.container} style={display}>
			<div className={styles.chart} ref={initHighcharts}/>
		</section>
	);
}
