import { RgbColor, Color } from "@/lib/services/core/types/rgbColor";
import { mergeClasses } from "@/lib/services/core/utils";
import { Dispatch, useCallback, useMemo } from "react";
import { HexColorPicker } from "react-colorful";

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

	const hexColor = useMemo(() => Color.rgbToHex(color), [color]);

	const onHexColorChange = useCallback((hexColor: string) => {
		const rgbColor = Color.hexToRgb(hexColor);
		onColorChange(rgbColor);
	}, [onColorChange]);

  	return <HexColorPicker
		className={mergeClasses(
			"",
			className)
		}
		{...otherProps}
		color={hexColor}
		onChange={onHexColorChange}
	/>;
}
  
export default AleasColorPicker;