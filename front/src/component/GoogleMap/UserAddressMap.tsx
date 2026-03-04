import GoogleMapReact from "google-map-react";
import { useState, useEffect } from "react";
import HttpClient from "@/adapter/HttpClient";

type Position = {
  lat: number;
  lng: number;
};

type Props = {
  officeLatLng: Position;
  addressPosition: Position;
  mapVersion: number;
  submitFunction: (lat: number, lng: number) => void;
};

const UserAddressMap = ({
  officeLatLng,
  addressPosition,
  mapVersion,
  submitFunction,
}: Props) => {
  const [stopPosition, setStopPosition] = useState<Position>(addressPosition);
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
        setState({ lat: e.latLng.lat(), lng: e.latLng.lng() });
      });
    };

    // officePositionに基づく移動不可のマーカーを追加
    const officeMarker = new maps.Marker({
      position: officeLatLng,
      map: map,
      draggable: false,
      icon: {
        path: "M12,2C8.13,2,5,5.13,5,9c0,5.25,7,13,7,13s7-7.75,7-13C19,5.13,15.87,2,12,2z",
        anchor: new maps.Point(12, 20),
        fillColor: "#34A853",
        fillOpacity: 1.0,
        scale: 2,
        strokeColor: "#34A853",
        strokeWeight: 1.0,
      },
    });
    attachMessage(officeMarker, "<p>事業所</p>", false);

    const userMarker = new maps.Marker({
      position: stopPosition,
      map: map,
      draggable: true, // ユーザーが移動可能
    });
    addMarkerDragendEvent(userMarker, setStopPosition);

    map.addListener("click", (event: any) => {
      userMarker.setPosition(event.latLng);
      setStopPosition(roundLatLng(event.latLng.lat(), event.latLng.lng()));
    });

    // attachMessage(userMarker, "<p>事業所</p>");

    // const stopMarkerSetting = (lat: number, lng: number) => {
    //   const stopMarker = new maps.Marker({
    //     position: { lat: Number(lat), lng: Number(lng) },
    //     map: map,
    //     draggable: true,
    //     icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
    //   });
    //   attachMessage(stopMarker, "<p>停車位置</p>", true);
    //   setStopPosition({ lat, lng });
    //   addMarkerDragendEvent(stopMarker, setStopPosition);
    // };

    // if (stopPosition?.lat && stopPosition?.lng) {
    //   stopMarkerSetting(stopPosition.lat, stopPosition.lng);
    // } else {
    //   let stopMarkerNotExist = true;
    //   map.addListener("click", (event: any) => {
    //     if (stopMarkerNotExist) {
    //       stopMarkerSetting(event.latLng.lat(), event.latLng.lng());
    //       stopMarkerNotExist = false;
    //     }
    //   });
    // }
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
          defaultCenter={officeLatLng}
          defaultZoom={15}
          onGoogleApiLoaded={handleApiLoaded}
        />
      </div>
      <div className="button" style={{ margin: "1em" }}>
        <button
          type="button"
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

export default UserAddressMap;
