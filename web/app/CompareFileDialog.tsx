import { Dispatch, ForwardedRef, forwardRef, useEffect, useRef, useState } from "react";
import clsx from "clsx";
import { TbX } from "react-icons/tb";
import { DragDropContext, Draggable, Droppable, DropResult } from "react-beautiful-dnd";
import { dataSizeIEC, uniqueId } from "@kaciras/utilities/browser";
import { Button, Dialog, FileDrop } from "../ui/index.ts";
import { drawImage } from "../utils.ts";
import { decode } from "../features/decode.ts";
import { getPooledWorker, ImageWorker, InputImage, newImagePool } from "../features/image-worker.ts";
import { CompareData } from "./CompareSession.tsx";
import styles from "./CompareFileDialog.scss";
import i18n from "../i18n.ts";

interface InputWithId extends InputImage {
	id: number;
}

interface PreviewBoxProps {
	value: InputImage;
	index: number;
	isDragging: boolean;
	onRemove: () => void;
}

const PreviewBox = forwardRef((props: PreviewBoxProps, ref: ForwardedRef<HTMLLIElement>) => {
	const { value, index, isDragging, onRemove, ...others } = props;
	const { file, raw } = value;
	const { type, size } = file;
	const { width, height } = raw;

	const canvas = useRef<HTMLCanvasElement>(null);

	useEffect(() => drawImage(raw, canvas.current), [raw]);

	const clazz = clsx(
		styles.listitem,
		isDragging && styles.dragging,
	);

	return (
		<li {...others} className={clazz} ref={ref}>
			<canvas
				className={styles.canvas}
				ref={canvas}
				width={width}
				height={height}
			/>
			<div className={styles.attrLine}>
				{
					index === 0
						? <span>Original</span>
						: <span># {index - 1}</span>
				}
				<Button
					className={styles.reset}
					type="text"
					title={i18n("Remove")}
					onClick={onRemove}
				>
					<TbX/>
				</Button>
			</div>
			<div className={styles.filename}>
				{file.name}
			</div>
			<div className={styles.attrLine}>
				<span className={styles.mime}>{type}</span>
				({width} x {height}, {dataSizeIEC.formatDiv(size)})
			</div>
		</li>
	);
});

PreviewBox.displayName = "PreviewBox";

interface PreviewListProps {
	value: InputWithId[];
	onChange: Dispatch<InputWithId[]>;
}

function PreviewList(props: PreviewListProps) {
	const { value, onChange } = props;

	function removeAt(index: number) {
		const copy = Array.from(value);
		copy.splice(index, 1);
		onChange(copy);
	}

	function dragSort(result: DropResult) {
		const { source, destination } = result;
		if (!destination) {
			return;
		}
		const newValue = [...value];
		const [remove] = newValue.splice(source.index, 1);
		newValue.splice(destination.index, 0, remove);
		onChange(newValue);
	}

	const items = value.map((v, i) => (
		<Draggable
			key={v.id}
			draggableId={v.id.toString()}
			index={i}
		>
			{(provided, snapshot) => (
				<PreviewBox
					{...provided.draggableProps}
					{...provided.dragHandleProps}
					ref={provided.innerRef}
					isDragging={snapshot.isDragging}
					value={v}
					index={i}
					onRemove={() => removeAt(i)}
				/>
			)}
		</Draggable>
	));

	return (
		<DragDropContext onDragEnd={dragSort}>
			<Droppable droppableId="compare">
				{provided =>
					<ol
						className={styles.list}
						ref={provided.innerRef}
						{...provided.droppableProps}
					>
						{items}
						{provided.placeholder}
					</ol>
				}
			</Droppable>
		</DragDropContext>
	);
}

export interface CompareFileDialogProps {
	data?: CompareData;
	onAccept: Dispatch<CompareData>;
	onCancel: () => void;
}

export default function CompareFileDialog(props: CompareFileDialogProps) {
	const { data, onAccept, onCancel } = props;

	const [images, setImages] = useState<InputWithId[]>(() => {
		return data ? ([data.original, ...data.changed] as InputWithId[]) : [];
	});
	const imageWorker = useRef<ImageWorker>();
	const [error, setError] = useState<Error>();

	useEffect(initImagePool, []);

	function initImagePool() {
		const imagePool = newImagePool(navigator.hardwareConcurrency);
		imageWorker.current = getPooledWorker(imagePool);
		return () => imagePool.terminate();
	}

	function handleFileChange(files: File[]) {
		const tasks = [];
		for (const file of files) {
			tasks.push(decode(file, imageWorker.current).then(raw => ({ file, raw, id: uniqueId() })));
		}
		Promise.all(tasks)
			.then(v => setImages([...images, ...v]))
			.catch(setError);
	}

	function handleAccept() {
		onAccept({ original: images[0], changed: images.slice(1) });
	}

	const isInvalid = images.length < 2 || Boolean(error);

	return (
		<Dialog className={styles.dialog} onClose={onCancel}>
			{
				images.length > 0 ?
					<PreviewList value={images} onChange={setImages}/>
					:
					<div className={styles.placeholder}>
						<p>{i18n("AddAtLeast2Images")}</p>
						<p>{i18n("FirstIsTheOriginal")}</p>
						<p>{i18n("DndToReorder")}</p>
					</div>
			}
			<div className={styles.right}>
				<FileDrop
					className={styles.fileDrop}
					accept="image/*"
					multiple={true}
					onChange={handleFileChange}
					onError={setError}
					onSelectStart={() => setError(undefined)}
				/>
				<div className={styles.error}>{error?.message}</div>
				<div className={styles.actions}>
					<Button className="second" onClick={onCancel}>Back</Button>
					<Button disabled={isInvalid} onClick={handleAccept}>Next</Button>
				</div>
			</div>
		</Dialog>
	);
}
