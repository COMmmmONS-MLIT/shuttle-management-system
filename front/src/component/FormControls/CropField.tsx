import React, { useState } from "react";
import Image from "next/image";
import { Crop } from "react-image-crop";
import ReactCrop from "react-image-crop";
const MAX_CROP_WIDTH = 800; //トリミングウィンドウの幅
const MAX_CROP_HEIGHT = 600; //トリミングウィンドウの高さ

type Props = {
  initialImage: string;
  aspectW: number;
  aspectH: number;
  cropped: boolean;
  setCroppedImage: (image: string) => void;
  closeCropField: () => void;
  index?: number | string;
};

type ImageStyle = {
  width: "auto" | number;
  height: "auto" | number;
};

const CropField = ({
  initialImage,
  aspectW,
  aspectH,
  cropped,
  setCroppedImage,
  closeCropField,
  index = "",
}: Props) => {
  const [crop, setCrop] = useState<Crop>();
  const [imageStyle, setImageStyle] = useState<ImageStyle>({
    width: "auto", //大きさを指定すると、onLoad時に大きさが読み取れなくなるため、初期値はauto
    height: "auto",
  });

  //選択された画像の縦横比で、ウィンドウに表示する画像の幅・高さを計算
  const handleImageLoad = (e: React.ChangeEvent<HTMLImageElement>) => {
    const naturalWidth = e.target.naturalWidth;
    const naturalHeight = e.target.naturalHeight;
    const aspectRatioH = naturalWidth / naturalHeight; //高さ基準のアスペクト比
    const aspectRatioW = naturalHeight / naturalWidth; //幅基準のアスペクト比

    if (naturalWidth > naturalHeight) {
      //表示する画像の大きさが幅800,高さ600を超えないように計算
      //この場合アップロードされた画像は幅の方が大きいので、まず幅800とした場合の高さを計算し、それが600を超えるようなら、高さを600とする
      const height =
        MAX_CROP_WIDTH * aspectRatioW > MAX_CROP_HEIGHT
          ? MAX_CROP_HEIGHT
          : MAX_CROP_WIDTH * aspectRatioW;
      const width = height * aspectRatioH;
      setImageStyle({
        width: width,
        height: height,
      });
      setInitialCrop(width, height);
    } else {
      //上と同様に計算
      const width =
        MAX_CROP_HEIGHT * aspectRatioH > MAX_CROP_WIDTH
          ? MAX_CROP_WIDTH
          : MAX_CROP_HEIGHT * aspectRatioH;
      const height = width * aspectRatioW;
      setImageStyle({
        width: width,
        height: height,
      });
      setInitialCrop(width, height);
    }
  };

  //表示された画像の大きさにより、トリミング範囲の計算
  const setInitialCrop = (imageW: number, imageH: number) => {
    const aspectRatioH = aspectW / aspectH; //高さ基準のアスペクト比
    const aspectRatioW = aspectH / aspectW; //幅基準のアスペクト比
    if (imageW > imageH) {
      //トリミング範囲が画像の大きさを超えないよう計算
      //この場合画像は幅の方が大きいので、まずトリミング幅をimageWとした場合のトリミングの高さを計算し、それがimageHを超えるようなら、トリミングの高さをimageHとする
      const width =
        imageH * aspectRatioH > imageW ? imageW : imageH * aspectRatioH;
      setCrop({
        unit: "px",
        x: 0,
        y: 0,
        width: width,
        height: width * aspectRatioW,
      });
    } else {
      //幅の時と同様
      const height =
        imageW * aspectRatioW > imageH ? imageH : imageW * aspectRatioW;
      setCrop({
        unit: "px",
        x: 0,
        y: 0,
        width: height * aspectRatioH,
        height: height,
      });
    }
  };

  const onCrop = () => {
    const imageElement: any = document.getElementById(`cropImage${index}`);
    if (imageElement && crop && crop.width && crop.height) {
      const image = cropping(imageElement, crop);
      if (image) {
        const base64 = image.split(",")[1];
        setCroppedImage(base64);
      }
    }
  };

  const cropping = (image: HTMLImageElement, crop: Crop) => {
    const canvas = document.createElement("canvas");
    canvas.width = aspectW;
    canvas.height = aspectH;
    const ctx = canvas.getContext("2d");
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    if (ctx) {
      ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        aspectW,
        aspectH,
      );

      return canvas.toDataURL("image/jpeg", 0.99); //画像圧縮も兼ねる(画質を落とす)
    }
  };

  return (
    <>
      <div className={`modalSCT ${cropped ? "active" : ""}`}>
        <div className="mask"></div>
        <div className="cont">
          <div className="close" onClick={() => closeCropField()}></div>
          <div className="inner trimmingMDL">
            <div className="trimmingZone">
              {/* @ts-ignore */}
              <ReactCrop
                crop={crop}
                ruleOfThirds
                aspect={aspectW / aspectH}
                onChange={(crop: Crop) => setCrop(crop)}
              >
                <Image
                  width={0}
                  height={0}
                  style={imageStyle}
                  src={initialImage}
                  alt=""
                  onLoad={handleImageLoad}
                  id={`cropImage${index}`}
                />
              </ReactCrop>
              <div className="button">
                <button
                  disabled={!(crop && crop.width && crop.height)}
                  type="button"
                  id="trimmingButton"
                  onClick={onCrop}
                >
                  トリミング
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CropField;
