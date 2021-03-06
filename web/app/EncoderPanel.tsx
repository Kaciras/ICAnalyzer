import { Dispatch, MouseEvent, useState } from "react";
import clsx from "clsx";
import AddIcon from "bootstrap-icons/icons/plus-circle.svg";
import RemoveIcon from "bootstrap-icons/icons/x.svg";
import { IconButton } from "../ui";
import { ENCODERS } from "../codecs";
import styles from "./EncoderPanel.scss";

export type EncodeConfig = Record<string, any>;

export interface EncoderPanelProps {
	value: EncodeConfig;
	onChange: Dispatch<EncodeConfig>;
}

export default function EncoderPanel(props: EncoderPanelProps) {
	const [list, setList] = useState(ENCODERS);
	const [stateMap, setStateMap] = useState(props.value);

	const [current, setCurrent] = useState(ENCODERS[0]);

	function showAddList() {
		// TODO
	}

	const menuItems = list.map((encoder, i) => {
		const classes = clsx(
			styles.menuItem,
			{ [styles.active]: encoder === current },
		);

		function removeThis(e: MouseEvent) {
			e.stopPropagation();

			list.splice(i, 1);
			setList([...list]);

			if (encoder === current) {
				setCurrent(list[0]);
			}
		}

		return (
			<div
				className={classes}
				key={encoder.name}
				onClick={() => setCurrent(encoder)}
			>
				<IconButton
					className={styles.remove}
					onClick={removeThis}
				>
					<RemoveIcon/>
				</IconButton>
				<span className={styles.name}>{encoder.name}</span>
			</div>
		);
	});

	function handleOptionChange(value: any) {
		const newStateMap = { ...stateMap, [current.name]: value };
		setStateMap(newStateMap);
		props.onChange(newStateMap);
	}

	const { OptionsPanel } = current;

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
			<OptionsPanel
				state={stateMap[current.name]}
				onChange={handleOptionChange}
			/>
		</div>
	);
}
