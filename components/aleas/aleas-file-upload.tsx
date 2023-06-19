import { ChangeEvent, useCallback, useRef, useState } from "react";

interface AleasFileUploadProps {
    multiple?: boolean;
}

const AleasFileUpload = (props: AleasFileUploadProps) => {

    const {
        multiple
    } = {
        multiple: false,
        ...props
    }

    const [dragActive, setDragActive] = useState<boolean>(false);
    const inputRef = useRef<HTMLInputElement>(null);
    
    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        }
        else if (e.type === "dragleave") {
            setDragActive(false);
        }
    }, []);
    
    
    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer?.files && e.dataTransfer.files[0]) {
            // handleFiles(e.dataTransfer.files);
        }
    }, [])
    
    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            // handleFiles(e.target.files);
        }
    }, []);
    
  
    const onButtonClick = () => {
        inputRef.current?.click();
    };
    //https://www.codemzy.com/blog/react-drag-drop-file-upload
    return (
      <form onDragEnter={handleDrag} onSubmit={(e) => e.preventDefault()}>
        <input ref={inputRef} type="file" multiple={multiple} onChange={handleChange} />
        <label id="label-file-upload" htmlFor="input-file-upload" className={dragActive ? "drag-active" : "" }>
            <div>
                <div>Drag and drop your file here or</div>
                <button className="upload-button" onClick={onButtonClick}>Upload a file</button>
            </div> 
        </label>
        { dragActive && <div id="drag-file-element" onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}></div> }
      </form>
    );
  };

export default AleasFileUpload;