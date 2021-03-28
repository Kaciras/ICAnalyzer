import { useEffect, useMemo, useState } from "react";
import Highcharts, { Chart, Options, SeriesLineOptions, YAxisOptions } from "highcharts";
import Export from "highcharts/modules/exporting";
import ExportOffline from "highcharts/modules/offline-exporting";
import { ConvertOutput } from "../encode";
import { InputImage } from "./index";
import styles from "./ChartPanel.scss";
import { Button } from "../ui";
import LockIcon from "../assets/lock.svg";

Export(Highcharts);
ExportOffline(Highcharts);

type MapFn = (output: ConvertOutput) => number | undefined;

class SeriesMapper {

	private readonly mapping: MapFn[] = [];
	private readonly divisor: number;

	readonly labels: string[] = [];

	constructor(original: InputImage, outputs: ConvertOutput[]) {
		this.divisor = original.file.size / 100;

		const { labels, mapping, divisor } = this;
		const [output] = outputs;

		function define(name: string, fn: MapFn) {
			if (fn(output) !== undefined) {
				mapping.push(fn);
				labels.push(name);
			}
		}

		define("Compression Ratio %", v => v.buffer.byteLength / divisor);
		define("Encode Time (s)", v => v.time);
		define("SSIM", v => v.metrics.SSIM);
		define("PSNR (db)", v => v.metrics.PSNR);
		define("Butteraugli Source", v => v.metrics.butteraugli?.source);
	}

	convert(outputs: ConvertOutput[]) {
		return this.mapping.map(fn => outputs.map(output => fn(output)!));
	}
}

function handleMouseover(chart: Chart, i: number) {
	chart.yAxis.forEach((axis, j) => {
		if (j === 0) return;
		axis.update({ visible: i === j }, false);
	});
	chart.redraw();
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
	const [locked, setLocked] = useState<boolean>(false);

	const mapper = useMemo(() => new SeriesMapper(original, outputs), [original]);

	function initHighcharts(el: HTMLDivElement | null) {
		if (!el || chart) {
			return;
		}

		const data = mapper.convert(outputs);
		const series = new Array<SeriesLineOptions>(data.length);
		const yAxis = new Array<YAxisOptions>(data.length);

		for (let i = 0; i < data.length; i++) {
			const name = mapper.labels[i];
			series[i] = {
				name,
				type: "line",
				data: data[i],
				yAxis: i,
			};
			yAxis[i] = {
				title: {
					text: name,
				},
				visible: false,
				opposite: true,
			};
		}

		const [left, firstRight] = yAxis;
		left.visible = true;
		left.opposite = false;
		if (firstRight) {
			firstRight.visible = true;
		}

		const options: Options = {
			series,
			yAxis,
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
				width: 430,
			},
			exporting: {
				buttons: {
					contextButton: {
						y: 5,
						x: -5,
						height: 32,
						width: 32,
						symbolSize: 16,
						symbolX: 17,
						symbolY: 16,
					},
				},
				chartOptions: {
					chart: {
						className: "exporting_chart_class",
					},
				},
			},
		};
		setChart(Highcharts.chart(el, options, instance => {
			addSeriesListener(instance);
			addLegendListener(instance);
		}));
	}

	function updateSeriesData(chart: Chart) {
		const data = mapper.convert(outputs);
		chart.xAxis[0].setCategories(values, false);
		chart.series.forEach((s, i) => s.setData(data[i], false));
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
				const { name, options } = this as any;
				const value = options.data[index];
				let displayValue;

				switch (value) {
					case +Infinity:
						displayValue = "∞";
						break;
					case -Infinity:
						displayValue = "-∞";
						break;
					default:
						displayValue = value.toFixed(2);
						break;
				}
				return `<span>${name}: </span><b>${displayValue}<br/>`;
			},
		});
		addLegendListener(chart);
	}

	useEffect(() => chart && updateSeriesData(chart), [outputs]);
	useEffect(() => chart && updatePlotLine(chart));

	function handleLockChange() {
		if (locked) {
			const clear = { min: null, max: null };
			chart!.yAxis.forEach(y => y.update(clear, false));
			setLocked(false);
		} else {
			setLocked(true);
			chart!.yAxis.forEach(y => y.update({ min: y.min, max: y.max }), false);
		}
		chart!.redraw();
	}

	// High cost of rendering chart, so keep the element
	const display = visible ? {} : { display: "none" };

	return (
		<section className={styles.container} style={display}>
			<Button
				title="Lock Y axis range"
				type="text"
				className={styles.lock}
				active={locked}
				onClick={handleLockChange}
			>
				<LockIcon/>
			</Button>
			<div className={styles.chart} ref={initHighcharts}/>
		</section>
	);
}
