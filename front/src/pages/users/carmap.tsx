import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/router";
import GoogleMapReact from "google-map-react";
import HttpClient from "@/adapter/HttpClient";
import { ResponseOfficeLatLng } from "@/types/ApiResponse/customer";
import { ErrorToast } from "@/component/ReactHotToast/ToastMessage";
import styles from "@/styles/css/yoteOta.module.css";

type CarPosition = {
  updatedAt: string;
  lat: number;
  lng: number;
};

const CarMapPage = () => {
  const router = useRouter();
  const httpClient = new HttpClient();
  const { carid, lat, lng } = router.query;

  const [carPosition, setCarPosition] = useState<CarPosition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [officeCenter, setOfficeCenter] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  const mapRef = useRef<any>(null);
  const mapsRef = useRef<any>(null);
  const carMarkerRef = useRef<any>(null);
  const homeMarkerRef = useRef<any>(null);
  const pulseOverlayRef = useRef<any>(null);

  const carId = carid ? String(carid) : null;
  const homeLat = lat ? parseFloat(String(lat)) : 0;
  const homeLng = lng ? parseFloat(String(lng)) : 0;

  // デフォルトの中心位置
  const defaultCenter = officeCenter ?? { lat: 0, lng: 0 };

  useEffect(() => {
    fetchOfficeLatLng();
    if (carId) {
      fetchCarPosition();
    } else {
      ErrorToast("車両番号が指定されていません");
      setError("車両番号が指定されていません");
      setLoading(false);
    }
  }, [carId]);

  // 3分ごとに自動で車両位置を取得
  useEffect(() => {
    if (!carId) return;

    const intervalId = setInterval(
      () => {
        fetchCarPosition();
      },
      3 * 60 * 1000,
    ); // 3分 = 180000ミリ秒

    // クリーンアップ関数でタイマーをクリア
    return () => {
      clearInterval(intervalId);
    };
  }, [carId]);

  const fetchOfficeLatLng = async () => {
    try {
      const response = await httpClient.get<ResponseOfficeLatLng>(
        "/customers/office_latlng",
      );
      const lat = Number(response.data.office_latlng.lat);
      const lng = Number(response.data.office_latlng.lng);
      if (lat && lng && !isNaN(lat) && !isNaN(lng)) {
        setOfficeCenter({ lat, lng });
      }
    } catch (error) {
      console.error("事業所の位置情報の取得に失敗しました:", error);
      ErrorToast("事業所の位置情報の取得に失敗しました");
    }
  };

  const fetchCarPosition = async () => {
    if (!carId) return;

    setLoading(true);
    setError(null);

    try {
      // 今日の日付を取得（YYYY-MM-DD形式に統一）
      const today = new Date();
      const yyyy = today.getFullYear();
      const MM = String(today.getMonth() + 1).padStart(2, "0");
      const dd = String(today.getDate()).padStart(2, "0");
      const dateStr = `${yyyy}-${MM}-${dd}`;

      // 車両位置情報を取得
      // 日付パラメータはオプショナル（指定しない場合は最新の位置情報を取得）
      const params: { id: string; date?: string } = {
        id: carId,
      };
      // 日付を指定する場合（バックエンドが対応している場合）
      // params.date = dateStr;

      const response = await httpClient.get<{
        cars: Array<{
          id: number;
          lat: number;
          lng: number;
          updated_at?: string;
        }>;
      }>("/cars/locations", {
        params,
      });

      const cars = response.data.cars || [];

      if (cars.length > 0) {
        const car = cars[0];

        // 緯度経度が有効な値かチェック
        if (
          car.lat &&
          car.lng &&
          !isNaN(car.lat) &&
          !isNaN(car.lng) &&
          car.lat !== 0 &&
          car.lng !== 0
        ) {
          setCarPosition({
            updatedAt: car.updated_at || "取得日時不明",
            lat: car.lat,
            lng: car.lng,
          });
        } else {
          console.error("無効な緯度経度:", car.lat, car.lng);
          ErrorToast("位置情報の緯度経度が無効です。");
          setError("位置情報の緯度経度が無効です。");
        }
      } else {
        console.warn("車両が見つかりませんでした");
        ErrorToast("位置情報が取得できませんでした。");
        setError("位置情報が取得できませんでした。");
      }
    } catch (error: any) {
      console.error("車両位置情報の取得に失敗しました:", error);
      ErrorToast(
        "位置情報が取得できませんでした。前の画面へ戻り、再度お試しください。",
      );
      setError(
        "位置情報が取得できませんでした。前の画面へ戻り、再度お試しください。",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleApiLoaded = ({ map, maps }: { map: any; maps: any }) => {
    mapRef.current = map;
    mapsRef.current = maps;

    map.setOptions({
      streetViewControl: true,
      mapTypeControl: true,
      mapTypeControlOptions: {
        position: maps.ControlPosition.TOP_RIGHT,
      },
      fullscreenControl: false,
      zoomControl: true,
      gestureHandling: "cooperative",
    });

    // マーカーを設定
    setCarLocation();
  };

  const setCarLocation = () => {
    const map = mapRef.current;
    const maps = mapsRef.current;
    if (!map || !maps || !carPosition) return;

    // 既存のマーカーを削除
    if (carMarkerRef.current) {
      carMarkerRef.current.setMap(null);
    }
    if (homeMarkerRef.current) {
      homeMarkerRef.current.setMap(null);
    }
    if (pulseOverlayRef.current) {
      pulseOverlayRef.current.setMap(null);
    }

    // 車両位置が取得できた場合
    if (carPosition.lat > 0 && carPosition.lng > 0) {
      // パルスアニメーション付きの車両マーカーを作成
      // カスタムオーバーレイを使用してパルスアニメーションを実装
      class PulseOverlay extends maps.OverlayView {
        private position: { lat: number; lng: number };
        private div: HTMLDivElement | null = null;

        constructor(position: { lat: number; lng: number }) {
          super();
          this.position = position;
        }

        onAdd() {
          this.div = document.createElement("div");
          this.div.style.position = "absolute";
          this.div.style.width = "32px";
          this.div.style.height = "32px";
          this.div.style.borderRadius = "50%";
          this.div.style.backgroundColor = "#5AB9D0";
          this.div.style.opacity = "0.6";
          this.div.style.animation = "pulse 2s infinite";
          this.div.style.transform = "translate(-50%, -50%)";
          this.div.style.pointerEvents = "none";

          const panes = this.getPanes();
          if (panes && panes.overlayMouseTarget) {
            panes.overlayMouseTarget.appendChild(this.div);
          }
        }

        draw() {
          if (!this.div) return;

          const projection = this.getProjection();
          const point = projection.fromLatLngToDivPixel(
            new maps.LatLng(this.position.lat, this.position.lng),
          );

          if (point) {
            this.div.style.left = point.x + "px";
            this.div.style.top = point.y + "px";
          }
        }

        onRemove() {
          if (this.div && this.div.parentNode) {
            this.div.parentNode.removeChild(this.div);
            this.div = null;
          }
        }
      }

      // パルスオーバーレイを作成
      const pulseOverlay = new PulseOverlay({
        lat: carPosition.lat,
        lng: carPosition.lng,
      });
      pulseOverlay.setMap(map);
      pulseOverlayRef.current = pulseOverlay;

      // 車両マーカーを作成
      const carIcon = {
        path: maps.SymbolPath.CIRCLE,
        scale: 8,
        fillColor: "#5AB9D0",
        fillOpacity: 1,
        strokeColor: "#5AB9D0",
        strokeWeight: 2,
      };

      const carMarker = new maps.Marker({
        position: { lat: carPosition.lat, lng: carPosition.lng },
        map: map,
        icon: carIcon,
        title: `${carId}号車`,
        zIndex: 1000,
      });

      const infoWindow = new maps.InfoWindow({
        content: `<div style="padding: 5px; font-weight: bold;">${carId}号車</div>`,
      });

      carMarker.addListener("click", () => {
        infoWindow.open(map, carMarker);
      });

      infoWindow.open(map, carMarker);

      carMarkerRef.current = carMarker;

      // 自宅座標が取得できた場合
      if (homeLat > 0 && homeLng > 0) {
        const homeIcon = {
          path: "M12,2C8.13,2,5,5.13,5,9c0,5.25,7,13,7,13s7-7.75,7-13C19,5.13,15.87,2,12,2z",
          anchor: new maps.Point(12, 20),
          fillColor: "#EA4335",
          fillOpacity: 1.0,
          scale: 2,
          strokeColor: "#EA4335",
          strokeWeight: 1.0,
        };

        const homeMarker = new maps.Marker({
          position: { lat: homeLat, lng: homeLng },
          map: map,
          icon: homeIcon,
          title: "ご自宅",
        });

        homeMarkerRef.current = homeMarker;
      }

      // 中心を車の位置に移動
      map.setCenter({ lat: carPosition.lat, lng: carPosition.lng });
      map.setZoom(14);
    }
  };

  // 車両位置が更新されたらマーカーを再描画
  useEffect(() => {
    if (carPosition && mapRef.current && mapsRef.current) {
      setCarLocation();
    }
  }, [carPosition]);

  const handleRefresh = () => {
    fetchCarPosition();
  };

  const handleMoveToCar = () => {
    if (carPosition && mapRef.current) {
      mapRef.current.setCenter({ lat: carPosition.lat, lng: carPosition.lng });
      mapRef.current.setZoom(14);
    }
  };

  const handleMoveToHome = () => {
    if (homeLat > 0 && homeLng > 0 && mapRef.current) {
      mapRef.current.setCenter({ lat: homeLat, lng: homeLng });
      mapRef.current.setZoom(14);
    }
  };

  const handleBack = () => {
    router.push("/users");
  };

  if (loading) {
    return (
      <div className={styles["test-page"]}>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            fontSize: "4vmin",
          }}
        >
          読み込み中...
        </div>
      </div>
    );
  }

  if (error || !carPosition || carPosition.lat <= 0 || carPosition.lng <= 0) {
    return (
      <div className={styles["test-page"]}>
        <div className={styles.h2} style={{ marginTop: "40px" }}>
          <div
            style={{
              fontSize: "3.5vmin",
              fontWeight: "600",
              lineHeight: "1",
              paddingTop: "1vmax",
            }}
          >
            <p className={styles.error1}>
              {error || "位置情報が取得できませんでした。"}
            </p>
            <p className={styles.error1}>
              前の画面へ戻り、再度お試しください。
            </p>
          </div>
          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <button
              className={`${styles.btn1} ${styles["btn-blue"]}`}
              onClick={handleBack}
            >
              前の画面へ戻る
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles["test-page"]}>
      <div className={styles.h2} style={{ marginTop: "40px" }}>
        <p className={styles["box-flex"]} style={{ height: "6vmax" }}>
          <button
            className={`${styles.btn1} ${styles["btn-orange"]}`}
            onClick={handleRefresh}
          >
            車両位置を更新
          </button>
          <span style={{ display: "inline-block" }}>
            <button
              className={`${styles.btn1} ${styles["btn-s"]} ${styles["btn-orange"]}`}
              onClick={handleMoveToHome}
              disabled={homeLat <= 0 || homeLng <= 0}
            >
              ご自宅
            </button>
            <button
              className={`${styles.btn1} ${styles["btn-s"]} ${styles["btn-orange"]}`}
              onClick={handleMoveToCar}
              style={{ marginLeft: "2vmin" }}
            >
              車両
            </button>
          </span>
        </p>
        <p id="nowpos3" style={{ margin: 0, fontSize: "3vmin" }}>
          更新時刻：{carPosition.updatedAt}
        </p>

        <div
          id="mapid"
          style={{ width: "100%", height: "60vh", marginTop: "20px" }}
        >
          {/* @ts-ignore */}
          <GoogleMapReact
            bootstrapURLKeys={{
              key: process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY as string,
            }}
            defaultCenter={defaultCenter}
            defaultZoom={14}
            onGoogleApiLoaded={handleApiLoaded}
            yesIWantToUseGoogleMapApiInternals
            options={{
              gestureHandling: "cooperative",
            }}
          />
        </div>

        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <button
            className={`${styles.btn1} ${styles["btn-blue"]}`}
            onClick={handleBack}
          >
            前の画面へ戻る
          </button>
        </div>
      </div>

      <style jsx global>{`
        @keyframes pulse {
          0% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.6;
          }
          50% {
            transform: translate(-50%, -50%) scale(1.5);
            opacity: 0.3;
          }
          100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.6;
          }
        }
      `}</style>
    </div>
  );
};

export default CarMapPage;
