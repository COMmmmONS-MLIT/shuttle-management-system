import GoogleMapReact from "google-map-react";
import { useEffect, useState } from "react";

type Position = {
  lat: Number;
  lng: Number;
};

type Waypoints = {
  location: {
    lat: Number;
    lng: Number;
  };
};

type Route = {
  position: Position;
  kinds: string;
  content: string;
};

const defaultCenter = {
  lat: 35.570428,
  lng: 139.61208,
};

const pickupColor = ["#bd7eff", "#ea4335", "#fbbc04", "#34A853"];

const createFlagIcon = (maps: any) => {
  return {
    path: "M160 96C160 78.3 145.7 64 128 64C110.3 64 96 78.3 96 96L96 544C96 561.7 110.3 576 128 576C145.7 576 160 561.7 160 544L160 422.4L222.7 403.6C264.6 391 309.8 394.9 348.9 414.5C391.6 435.9 441.4 438.5 486.1 421.7L523.2 407.8C535.7 403.1 544 391.2 544 377.8L544 130.1C544 107.1 519.8 92.1 499.2 102.4L487.4 108.3C442.5 130.8 389.6 130.8 344.6 108.3C308.2 90.1 266.3 86.5 227.4 98.2L160 118.4L160 96z",
    fillColor: '#b0b0b0',
    fillOpacity: 1,
    anchor: new maps.Point(320, 320),
    strokeWeight: 1,
    strokeColor: '#ffffff',
    scale: 0.045,
  };
};
const Route = ({ route, mapVersion }: { route: any; mapVersion: number }) => {
  const [version, setVersion] = useState(0);
  useEffect(() => {
    setVersion(version + 1);
  }, [route.order]);

  const handleApiLoaded = ({ map, maps }: { map: any; maps: any }) => {
    const myOptions = {
      streetViewControl: true,
      mapTypeControl: true,
      mapTypeControlOptions: {
        position: maps.ControlPosition.TOP_RIGHT,
      },
      fullscreenControl: false,
    };
    map.setOptions(myOptions);

    const bounds = new maps.LatLngBounds();
    const directionsService = new maps.DirectionsService();

    // ルート検索処理
    const routeCreation = (
      origin: Position,
      waypoints: Waypoints[],
      destination: Position
    ) => {
      const directionsRenderer = new maps.DirectionsRenderer({
        draggable: false,
        map: map,
        suppressMarkers: true, // マーカーの非表示
        preserveViewport: true,
      });
      directionsRenderer.setMap(map);
      directionsService.route(
        {
          origin: origin,
          waypoints: waypoints,
          destination: destination,
          travelMode: maps.DirectionsTravelMode.DRIVING,
        },
        (response: any, status: any) => {
          if (status == maps.DirectionsStatus.OK) {
            directionsRenderer.setDirections(response);

            const startPosition = route.points[0].position;
            const endPosition = route.points[route.points.length - 1].position;

            const isSamePosition = (pos1: any, pos2: any) => {
              return pos1.lat === pos2.lat && pos1.lng === pos2.lng;
            };

            route.points.forEach((point: any, i: number) => {
              const latLng = new maps.LatLng(
                point.position.lat,
                point.position.lng
              );
              let marker: any;
              let icon: any;

              let label = "";

              // 出発地点、到着地点、またはそれらと同じ位置の地点は家のアイコン
              if (i === 0 ||
                  i === route.points.length - 1 ||
                  (point.kinds === "point" &&
                   (isSamePosition(point.position, startPosition) ||
                    isSamePosition(point.position, endPosition)))) {
                icon = createFlagIcon(maps);
              } else {
                label = "" + i;
                const colorIndex = i % pickupColor.length;
                const markerColor = pickupColor[colorIndex];
                icon = {
                  fillColor: markerColor,
                  fillOpacity: 1.0,
                  path: maps.SymbolPath.CIRCLE,
                  scale: 8,
                  strokeColor: markerColor,
                  strokeWeight: 1.0,
                };
              }

              marker = new maps.Marker({
                position: latLng,
                label: label,
                map: map,
                icon: icon,
              });
              const infoWindow = new maps.InfoWindow({
                content: point.content,
              });
              marker.addListener("click", () => {
                if (infoWindow.getMap()) {
                  infoWindow.close();
                } else {
                  infoWindow.open(map, marker);
                }
              });
            });
          } else {
            alert("ルート検索に失敗しました");
          }
        }
      );
    };

    // 出発と到着の地点を取得
    let origin = route.points[0].position;
    let destination = route.points[route.points.length - 1].position;
    // 中継地点取得
    let waypoints: Waypoints[] = [];
    route.points.forEach((route: any) => {
      waypoints.push({ location: route.position });
      bounds.extend(route.position);
    });
    waypoints.shift();
    waypoints.pop();
    routeCreation(origin, waypoints, destination);

    // 事業所の円表示
    // if (circleRadiul) {
    //   new maps.Circle({
    //     center: new maps.LatLng(officePosition.lat, officePosition.lng),
    //     radius: circleRadiul * 1000, // m単位に変換
    //     strokeColor: "#577f00",
    //     strokeOpacity: 0.8,
    //     strokeWeight: 2,
    //     fillColor: "#abbf60",
    //     fillOpacity: 0.4,
    //     map: map,
    //   });
    // }
    map.fitBounds(bounds);
  };

  return (
    <div id="canvas" style={{ width: "100%", height: "100%" }}>
      {/* @ts-ignore */}
      <GoogleMapReact
        key={version}
        bootstrapURLKeys={{
          key: process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY as string,
        }}
        defaultCenter={defaultCenter}
        defaultZoom={16}
        onGoogleApiLoaded={handleApiLoaded}
        yesIWantToUseGoogleMapApiInternals
      />
    </div>
  );
};

export default Route;
