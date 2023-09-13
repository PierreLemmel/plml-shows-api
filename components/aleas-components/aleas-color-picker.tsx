import { RgbColor } from "@/lib/services/core/types/rgbColor";
import { mergeClasses } from "@/lib/services/core/utils";
import { Dispatch } from "react";
import { RgbColorPicker } from "react-colorful";

export interface AleasColorPickerProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "color"> {
    color: RgbColor;
    onColorChange: Dispatch<RgbColor>;
}

const AleasColorPicker = (props: AleasColorPickerProps) => {

	const {
		color,
		onColorChange,
		className,
		...otherProps
	} = props;

  	return <RgbColorPicker
		className={mergeClasses(
			"",
			className)
		}
		{...otherProps}
		color={color}
		onChange={onColorChange}
	/>;
}
  
export default AleasColorPicker;