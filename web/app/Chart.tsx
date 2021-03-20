import { useEffect, useState } from "react";
import Highcharts, { Options, SeriesLineOptions, YAxisOptions } from "highcharts";
import { ConvertOutput } from "../encode";
import { InputImage } from "./index";
import "../highcharts.scss";
import styles from "./Chart.scss";

function refreshEcharts(original: InputImage, outputs: ConvertOutput[], values: string[]): Options {
	const yAxis: YAxisOptions[] = [];
	const series: SeriesLineOptions[] = [];

	let index = 0;

	function tryAddSeries(name: string, fn: (output: ConvertOutput) => number | undefined) {
		if (fn(outputs[0]) === undefined) {
			return;
		}
		const data = outputs.map(fn) as number[];
		yAxis.push({
			title: {
				text: name,
			},
			visible: false,
			opposite: true,
		});
		series.push({ name, type: "line", data, yAxis: index++ });
	}

	const divisor = original.file.size / 100;
	tryAddSeries("Compression Ratio %", v => v.buffer.byteLength / divisor);
	yAxis[0].visible = true;
	yAxis[0].opposite = false;

	tryAddSeries("Encode Time (ms)", v => v.time);
	tryAddSeries("SSIM", v => v.metrics.SSIM);
	tryAddSeries("PSNR (db)", v => v.metrics.PSNR);
	tryAddSeries("Butteraugli Source", v => v.metrics.butteraugli?.source);

	return {
		chart: {
			styledMode: true,
		},
		// legend: {
		// 	data: legends,
		// },
		xAxis: {
			categories: values,
		},
		yAxis,
		series,
	};
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
		const options = refreshEcharts(original, outputs, values);
		const c = Highcharts.chart(el, options);
		setChart(c);

		function handleMouseover(i: number) {
			c.yAxis.forEach((a, j) => {
				if (j === 0) {
					return;
				}
				a.update({ visible: i === j });
			});
		}

		c.series.forEach((s, i) => {
			if (i === 0) {
				return;
			}
			(s as any).legendItem.on("mouseover", () => handleMouseover(i));
		});
		c.legend.allItems.forEach((s, i) => {
			if (i === 0) {
				return;
			}
			s.onMouseOver = () => handleMouseover(i);
		});
	}

	useEffect(() => {
		if(!chart){
			return;
		}
		chart.update(refreshEcharts(original, outputs, values));
	}, [outputs]);

	useEffect(() => {
		if(!chart){
			return;
		}
		chart.xAxis[0].removePlotLine("x");
		chart.xAxis[0].addPlotLine({
			id: "x",
			value: index,
			dashStyle: "Dash",
		});
	}, [index]);

	return (
		<section className={styles.container}>
			<div className={styles.chart} ref={initEcharts}/>
		</section>
	);
}
