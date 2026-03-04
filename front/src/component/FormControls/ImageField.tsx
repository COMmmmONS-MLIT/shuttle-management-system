import { useCallback, useMemo, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import Image from "next/image";
import CropField from "./CropField";
import SetFormData from "./SetFormData";
import Base64Support from "../Widgets/Base64Support";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPen, faTrashAlt } from "@fortawesome/free-solid-svg-icons";

type Props = {
  file: string; //base64形式で登録されるためstring
  labelName: string;
  name: string;
  index?: number;
  setState: any;
  aspectW: number;
  aspectH: number;
  deleteFunction?: any;
};

const ImageField = ({
  file,
  labelName,
  name,
  index,
  setState,
  aspectW,
  aspectH,
  deleteFunction,
}: Props) => {
  const [initialImage, setInitialImage] = useState<string>();
  const [initialChangeable, setInitialChangeable] = useState<boolean>(true);
  const [cropped, setCropped] = useState<boolean>(false);

  useEffect(() => {
    if (initialChangeable) {
      setInitialImage(Base64Support(file));
    }
  }, [file]);

  const onDrop = useCallback((files: File[]) => {
    if (files.length > 0) {
      const reader = new FileReader();

      reader.readAsDataURL(files[0]);

      // 読み込みが完了したら処理を行う
      reader.onload = () => {
        // Base64形式のデータを取得
        const base64Data = reader.result as string;
        if (base64Data) {
          setInitialImage(base64Data);
          setCropped(true);
        }
      };
    }
  }, []);

  const setCroppedImage = (base64Image: string) => {
    setInitialChangeable(false); // イニシャル画像が変更されないよう、initialChangeableをfalseに変更
    SetFormData({ setState, name, value: base64Image, index });
    setCropped(false);
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "image/png": [".png", ".jpg", ".jpeg"],
    },
  });

  const removeImage = () => {
    if (confirm("本当に削除しますか？")) {
      if (deleteFunction) {
        deleteFunction();
      } else {
        SetFormData({ setState, name, value: "", index });
      }
      setCropped(false);
    }
  };

  const closeCropField = () => {
    setCropped(false);
  };

  const filePreview = useMemo(() => {
    if (!file) {
      return (
        <div {...getRootProps()} className="dropZone">
          <input {...getInputProps()} />
          <label>画像をここにドラッグ&amp;ドロップまたはクリックして選択</label>
        </div>
      );
    }

    return (
      <Image
        width={aspectW}
        height={aspectH}
        className="preview"
        src={Base64Support(file)}
        alt=""
      />
    );
  }, [file]);
  return (
    <>
      <div className={`imagebox ${file ? "view" : ""}`}>
        <span>{labelName}</span>
        {filePreview}
        <span className="editButton" onClick={() => setCropped(true)}>
          <FontAwesomeIcon icon={faPen} /> 編集
        </span>
        <span className="deleteButton" onClick={() => removeImage()}>
          <FontAwesomeIcon icon={faTrashAlt} />
          削除
        </span>
      </div>
      {initialImage && (
        <CropField
          initialImage={initialImage}
          aspectW={aspectW}
          aspectH={aspectH}
          cropped={cropped}
          setCroppedImage={setCroppedImage}
          closeCropField={closeCropField}
          index={index}
        />
      )}
    </>
  );
};

export default ImageField;
