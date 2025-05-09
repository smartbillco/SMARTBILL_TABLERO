import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class MapStyleService {
  private mapStyles = [
    { featureType: "all", elementType: "labels.text.fill", stylers: [{ saturation: 36 }, { lightness: 40 }] },
    { featureType: "all", elementType: "labels.text.stroke", stylers: [{ visibility: "on" }, { color: "#000000" }, { lightness: 16 }] },
    { featureType: "all", elementType: "labels.icon", stylers: [{ visibility: "off" }] },
    { featureType: "administrative", elementType: "geometry.fill", stylers: [{ color: "#2d353c" }, { lightness: 20 }] },
    { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#000000" }, { lightness: 17 }, { weight: 1.2 }] },
    { featureType: "administrative", elementType: "labels.text.fill", stylers: [{ color: "#d8d8d8" }] },
    { featureType: "landscape", elementType: "geometry.fill", stylers: [{ color: "#2d353c" }] },
    { featureType: "road.highway", elementType: "geometry.fill", stylers: [{ color: "#000000" }, { lightness: 17 }] },
    { featureType: "road.arterial", elementType: "geometry.fill", stylers: [{ color: "#575d63" }] },
    { featureType: "water", elementType: "geometry.fill", stylers: [{ color: "#1a1f23" }] },
  ];

  getMapStyles() {
    return this.mapStyles;
  }
}
