import { Dispatch, MouseEvent, useState } from "react";
import clsx from "clsx";
import AddIcon from "bootstrap-icons/icons/plus-circle.svg";
import RemoveIcon from "bootstrap-icons/icons/x.svg";
import { IconButton } from "../ui";
import { ENCODER_MAP, EncoderState } from "../codecs";
import styles from "./EncoderPanel.scss";

export type StateMap = Record<string, EncoderState>;

export interface EncoderPanelProps {
	value: StateMap;
	onChange: Dispatch<StateMap>;
}

export default function EncoderPanel(props: EncoderPanelProps) {
	const [stateMap, setStateMap] = useState(props.value);
	const [list, setList] = useState(["WebP"]);
	const [current, setCurrent] = useState("WebP");

	function showAddList() {
		// TODO
	}

	const menuItems = list.map((name, i) => {
		const classes = clsx(
			styles.menuItem,
			{ [styles.active]: name === current },
		);

		function removeThis(e: MouseEvent) {
			e.stopPropagation();

			list.splice(i, 1);
			setList([...list]);

			if (name === current) {
				setCurrent(list[0]);
			}
		}

		return (
			<div
				className={classes}
				key={name}
				tabIndex={0}
				onClick={() => setCurrent(name)}
			>
				<IconButton
					className={styles.remove}
					onClick={removeThis}
				>
					<RemoveIcon/>
				</IconButton>
				<span className={styles.name}>{name}</span>
			</div>
		);
	});

	function handleOptionChange(value: any) {
		const newStateMap = { ...stateMap, [current]: value };
		setStateMap(newStateMap);
		props.onChange(newStateMap);
	}

	const { OptionsPanel } = ENCODER_MAP[current];

	return (
		<div className={styles.container}>
			<div className={styles.menu}>
				{menuItems}
				<IconButton
					title="Add encoder"
					className={styles.add}
					onClick={showAddList}
				>
					<AddIcon/>
				</IconButton>
			</div>
			<div className={styles.optionsPanel}>
				<OptionsPanel
					state={stateMap[current]}
					onChange={handleOptionChange}
				/>
			</div>
		</div>
	);
}
