interface Result {
	original: ImageData;
	codec: {
		name: string;
		fixed: [];
		vars: [];
	};
	compressed: [];
}

export function serialize(result: Result) {

}
