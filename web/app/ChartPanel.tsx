import { useEffect, useState } from "react";
import clsx from "clsx";
import Highcharts, { Chart, Options, SeriesLineOptions, YAxisOptions } from "highcharts";
import Export from "highcharts/modules/exporting";
import ExportOffline from "highcharts/modules/offline-exporting";
import { TbLockFilled } from "react-icons/tb";
import { Button } from "../ui/index.ts";
import { MetricMeta } from "../features/measurement.ts";
import { AnalyzeResult } from "../features/image-worker.ts";
import styles from "./ChartPanel.scss";

Export(Highcharts);
ExportOffline(Highcharts);

declare module "highcharts" {

	interface Options {
		xLabel?: string;
	}
}

const baseOptions: Options = {
	accessibility: {
		enabled: false,
	},
	chart: {
		styledMode: true,
		animation: false,
	},
	title: {
		text: "",
	},
	tooltip: {
		borderRadius: 0,
	},
	legend: {
		verticalAlign: "top",
		width: 450,

		// Since legend item vary widely in width, disable align to use space more efficiently
		alignColumns: false,
	},
	xAxis: {
		// Avoid layout shift on Y axis changes
		width: 430,
	},
	exporting: {
		menuItemDefinitions: {
			downloadExpand: {
				text: "Download with full Axis",
				onclick() {
					const yAxis = new Array(this.yAxis.length);
					yAxis.fill({ visible: true });

					const optionsMixin = {
						yAxis,
						xAxis: {
							title: {
								text: this.options.xLabel,
							},
							plotLines: [],
						},
						legend: {
							labelFormat: "{name}",
							labelFormatter: undefined,
						},
					};

					this.exportChartLocal({ type: "image/svg+xml" }, optionsMixin);
				},
			},
		},
		buttons: {
			contextButton: {
				y: 5,
				x: -5,
				height: 32,
				width: 32,
				symbolSize: 16,
				symbolX: 17,
				symbolY: 16,
				menuItems: [
					"downloadSVG",
					"downloadExpand",
				],
			},
		},
		sourceWidth: 720,
		sourceHeight: 405,
		chartOptions: {
			legend: {
				// @ts-ignore According to the document, null is acceptable
				width: null,
			},
			// @ts-ignore According to the document, null is acceptable
			xAxis: {
				width: null,
			},
			chart: {
				className: "exporting_chart_class",
			},
		},
	},
};

function switchYAxis(chart: Chart, i: number) {
	const { yAxis } = chart;
	for (let j = 1; j < yAxis.length; j++) {
		yAxis[j].update({ visible: i === j }, false);
	}
	chart.redraw();
}

function addSeriesListener(chart: Chart) {
	const { series } = chart;
	for (let i = 1; i < series.length; i++) {
		series[i].onMouseOver = () => switchYAxis(chart, i);
	}
}

function addLegendListener(chart: Chart) {
	const { series } = chart;

	for (let i = 1; i < series.length; i++) {
		const { element } = (series[i] as any).legendItem.group;
		element.onmouseenter = () => switchYAxis(chart, i);
	}
}

export interface ChartProps {
	className?: string;
	visible: boolean;

	seriesMeta: MetricMeta[];
	index: number;
	xLabel: string;
	values: string[];
	outputs: AnalyzeResult[];
}

function toChartData(props: ChartProps) {
	const { seriesMeta, outputs, values, xLabel } = props;

	const { length } = seriesMeta;
	const series = new Array<SeriesLineOptions>(length);
	const yAxis = new Array<YAxisOptions>(length);

	for (let i = 0; i < length; i++) {
		const { key, name } = seriesMeta[i];
		yAxis[i] = {
			title: {
				text: name,
			},
			visible: false,
			opposite: true,
		};
		series[i] = {
			name,
			type: "line",
			yAxis: i,
			data: outputs.map(o => o.metrics[key]),
		};
	}

	const [left, initialRight] = yAxis;
	left.visible = true;
	left.opposite = false;
	if (initialRight) {
		initialRight.visible = true;
	}

	const xAxis = {
		categories: values,
	};

	return { series, yAxis, xAxis, xLabel } as Options;
}

export default function ChartPanel(props: ChartProps) {
	const { className, visible, seriesMeta, outputs, index, xLabel, values } = props;

	const [chart, setChart] = useState<Chart>();
	const [locked, setLocked] = useState(false);

	function initHighcharts(el: HTMLDivElement | null) {
		if (!el || chart) {
			return;
		}
		const dataPart = toChartData(props);
		const options = Highcharts.merge(baseOptions, dataPart);

		const newChart = Highcharts.chart(el, options);
		setChart(newChart);
		addSeriesListener(newChart);
		addLegendListener(newChart);
	}

	function updateSeriesData(chart: Chart) {
		chart.options.xLabel = xLabel;
		chart.xAxis[0].setCategories(values, false);

		chart.series.forEach((s, i) => {
			const { key } = seriesMeta[i];
			s.setData(outputs.map(output => output.metrics[key]), false);
		});
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
				return `${name}: <b>${displayValue}</b>`;
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
	const display = visible ? undefined : { display: "none" };

	return (
		<section
			className={clsx(styles.container, className)}
			style={display}
		>
			<Button
				title="Lock Y axis range"
				type="text"
				className={styles.lock}
				active={locked}
				onClick={handleLockChange}
			>
				<TbLockFilled/>
			</Button>
			<div className={styles.chart} ref={initHighcharts}/>
		</section>
	);
}
