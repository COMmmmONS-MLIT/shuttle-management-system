import { useEffect, useState } from "react";
import Route from "@/component/GoogleMap/Route";
import HttpClient from "@/adapter/HttpClient";

//type
import { ResponseVisitingRoute } from "@/types/ApiResponse/visiting";

// fontawesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser, faMap } from "@fortawesome/free-solid-svg-icons";

type Props = {
  routeId: number;
  removeRouteMap: () => void;
  mapVersion: number;
};

const RouteMap = ({ routeId, removeRouteMap, mapVersion }: Props) => {
  const httpClient = new HttpClient();
  const [route, setRoute] = useState<ResponseVisitingRoute>({
    points: [],
    order: [],
    car_name: "",
    bin_order: "",
  });
  useEffect(() => {
    getVisitingRoute();
  }, [routeId, mapVersion]);

  const getVisitingRoute = () => {
    httpClient
      .get<ResponseVisitingRoute>(`/visitings/${routeId}/route`)
      .then((res) => {
        setRoute(res.data);
      });
  };
  return (
    <div className="user">
      <div className="head">
        <h2>
          <FontAwesomeIcon icon={faMap} />
          ルート地図
        </h2>
        <div className="selectbox">
          <button
            type="button"
            aria-label="利用者一覧"
            onClick={removeRouteMap}
          >
            <FontAwesomeIcon icon={faUser} style={{ marginLeft: "0" }} />
            利用者一覧
          </button>
        </div>
      </div>
      <div className="routeInfo">
        <p>車両：{route.car_name}</p>
        <p>便順：{route.bin_order}</p>
      </div>
      <div style={{ height: "500px" }}>
        {route.points.length > 0 && (
          <Route route={route} mapVersion={mapVersion} />
        )}
        {route.points.length === 0 && <div>ルートがありません</div>}
      </div>
    </div>
  );
};

export default RouteMap;
