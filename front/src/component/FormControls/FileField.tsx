import { useState } from "react";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";

type Props = {
  onChenge: (file: File) => void;
};

const FileField = ({ onChenge }: Props) => {
  const [filePath, setFilePath] = useState<string>("選択されていません");
  const onDrop = useCallback((files: File[]) => {
    if (files[0]) {
      const file = files[0];
      onChenge(file);
      setFilePath(file.name);
    }
  }, []);

  const { getRootProps } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"],
    },
  });
  return (
    <div {...getRootProps()} className="dropZone">
      <label>
        ファイルをここにドラッグ&amp;ドロップまたはクリックして選択
        <br />
        ファイル: {filePath}
        <br />
      </label>
    </div>
  );
};

export default FileField;
