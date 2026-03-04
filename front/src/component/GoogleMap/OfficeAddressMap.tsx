import GoogleMapReact from "google-map-react";
import { useState } from "react";

type Position = {
  lat: number;
  lng: number;
};

type Props = {
  officePosition: Position;
  addressPosition: Position;
  mapVersion: number;
  submitFunction: (lat: number, lng: number) => void;
};

const UserPointMap = ({
  officePosition,
  addressPosition,
  mapVersion,
  submitFunction,
}: Props) => {
  const [stopPosition, setStopPosition] = useState<Position>(() => {
    // addressPosition（InputFieldの値）が存在する場合はそれを使用
    if (addressPosition?.lat && addressPosition?.lng) {
      return addressPosition;
    }
    // 存在しない場合はデフォルトの位置を使用
    return officePosition;
  });

  // 緯度経度の値を小数点以下6桁に丸める関数
  const roundLatLng = (lat: number, lng: number): Position => {
    return {
      lat: Number(lat.toFixed(6)),
      lng: Number(lng.toFixed(6)),
    };
  };

  const handleApiLoaded = ({ map, maps }: { map: any; maps: any }) => {
    const myOptions = {
      streetViewControl: true, // street viewの表示
      mapTypeControl: true, // 地図、航空写真の選択欄表示
      mapTypeControlOptions: {
        position: maps.ControlPosition.TOP_RIGHT,
      },
      fullscreenControl: false, // フルスクリーンボタンの非表示
      disableDoubleClickZoom: true, // ダブルクリックでのズーム規制
    };
    map.setOptions(myOptions);

    const attachMessage = (marker: any, msg: string, openWindow = false) => {
      const infoWindow = new maps.InfoWindow({
        content: msg,
      });
      marker.addListener("click", () => {
        if (infoWindow.getMap()) {
          infoWindow.close();
        } else {
          infoWindow.open(map, marker);
        }
      });
      if (openWindow) {
        infoWindow.open(map, marker);
      }
    };

    const addMarkerDragendEvent = (marker: any, setState: any) => {
      maps.event.addListener(marker, "dragend", (e: any) => {
        setState(roundLatLng(e.latLng.lat(), e.latLng.lng()));
      });
    };

    const userMarker = new maps.Marker({
      position: stopPosition,
      map: map,
      draggable: true,
    });
    // attachMessage(userMarker, "<p>事業所</p>", true);
    addMarkerDragendEvent(userMarker, setStopPosition);

    map.addListener("click", (event: any) => {
      userMarker.setPosition(event.latLng);
      setStopPosition(roundLatLng(event.latLng.lat(), event.latLng.lng()));
    });
  };

  return (
    <>
      <div id="canvas" style={{ width: "1000px", height: "500px" }}>
        {/* @ts-ignore */}
        <GoogleMapReact
          key={mapVersion}
          bootstrapURLKeys={{
            key: process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY as string,
          }}
          defaultCenter={stopPosition}
          defaultZoom={15}
          onGoogleApiLoaded={handleApiLoaded}
        />
      </div>
      <div className="head" style={{ margin: "1em" }}>
        <button
          type="button"
          className=""
          onClick={() => {
            const rounded = roundLatLng(stopPosition.lat, stopPosition.lng);
            submitFunction(rounded.lat, rounded.lng);
          }}
        >
          地点設定
        </button>
      </div>
    </>
  );
};

export default UserPointMap;
