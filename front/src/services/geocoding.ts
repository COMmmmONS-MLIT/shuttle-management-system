import HttpClient from "@/adapter/HttpClient";

type GeocodingResponse = {
  address_name: string;
  postcode: string | null;
  lat: number;
  lng: number;
};

export class GeocodingService {
  private httpClient: HttpClient;
  private readonly API_KEY: string;

  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
    this.API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY || "";
  }

  private formatAddress(
    formattedAddress: string,
    addressComponents: any[]
  ): string {
    let address = formattedAddress;

    // 国、郵便番号、都道府県を削除
    addressComponents.forEach((component) => {
      if (
        component.types.some((type: string) =>
          ["country", "postal_code", "administrative_area_level_1"].includes(
            type
          )
        )
      ) {
        address = address.replace(component.long_name, "");
      }
    });

    // 全角数字と記号を半角に変換
    return address
      .replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xfee0))
      .replace(/[−、〒 ]/g, "")
      .trim();
  }

  private extractPostalCode(addressComponents: any[]): string | null {
    const postalCodeComponent = addressComponents.find((component: any) =>
      component.types.includes("postal_code")
    );

    if (!postalCodeComponent) return null;

    return postalCodeComponent.long_name.replace(/-/g, "");
  }

  async getCoordinatesFromAddress(address: string): Promise<GeocodingResponse> {
    try {
      const url = "https://maps.googleapis.com/maps/api/geocode/json";
      const params = {
        address: address,
        language: "ja",
        key: this.API_KEY,
      };

      const fullUrl = `${url}?${new URLSearchParams(params).toString()}`;
      const response = await fetch(fullUrl);
      const data = await response.json();

      if (data.status !== "OK") {
        console.error("GeocodingService: APIエラー:", data.status);
        throw new Error(`Geocoding failed: ${data.error_message}`);
      }

      const result = data.results[0];
      const location = result.geometry.location;
      const addressComponents = result.address_components;

      const responseData = {
        address_name: this.formatAddress(
          result.formatted_address,
          addressComponents
        ),
        postcode: this.extractPostalCode(addressComponents),
        lat: location.lat,
        lng: location.lng,
      };

      return responseData;
    } catch (error) {
      console.error("GeocodingService: エラー詳細:", error);
      throw error;
    }
  }
}
