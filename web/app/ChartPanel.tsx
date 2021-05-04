import { useEffect, useState } from "react";
import clsx from "clsx";
import Highcharts, { Chart, Options, SeriesLineOptions, YAxisOptions } from "highcharts";
import Export from "highcharts/modules/exporting";
import ExportOffline from "highcharts/modules/offline-exporting";
import LockIcon from "../assets/lock.svg";
import { Button } from "../ui";
import { ConvertOutput } from "../encode";
import { MetricMeta } from "./index";
import styles from "./ChartPanel.scss";

Export(Highcharts);
ExportOffline(Highcharts);

function handleMouseover(chart: Chart, i: number) {
	const { yAxis } = chart;
	for (let j = 1; j < yAxis.length; j++) {
		yAxis[j].update({ visible: i === j }, false);
	}
	chart.redraw();
}

function addSeriesListener(chart: Chart) {
	const { allItems } = chart.legend;
	for (let i = 1; i < allItems.length; i++) {
		allItems[i].onMouseOver = () => handleMouseover(chart, i);
	}
}

function addLegendListener(chart: Chart) {
	const { series } = chart;
	for (let i = 1; i < series.length; i++) {
		(series[i] as any).legendItem.on("mouseover", () => handleMouseover(chart, i));
	}
}

export interface ChartProps {
	className?: string;
	visible: boolean;

	seriesMeta: MetricMeta[];
	index: number;
	values: string[];
	outputs: ConvertOutput[];
}

export default function ChartPanel(props: ChartProps) {
	const { className, visible, seriesMeta, outputs, index, values } = props;

	const [chart, setChart] = useState<Chart>();
	const [locked, setLocked] = useState<boolean>(false);

	function initHighcharts(el: HTMLDivElement | null) {
		if (!el || chart) {
			return;
		}

		const series = new Array<SeriesLineOptions>(seriesMeta.length);
		const yAxis = new Array<YAxisOptions>(seriesMeta.length);

		for (let i = 0; i < seriesMeta.length; i++) {
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
				data: outputs.map(output => output.metrics[key]),
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
				width: 450,

				// Since legend item vary widely in width, disable align to use space more efficiently
				alignColumns: false,
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
				<LockIcon/>
			</Button>
			<div className={styles.chart} ref={initHighcharts}/>
		</section>
	);
}
