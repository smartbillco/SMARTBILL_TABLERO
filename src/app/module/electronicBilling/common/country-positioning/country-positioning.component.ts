import { Component, OnInit, ViewEncapsulation } from "@angular/core";
// @ts-ignore
import jsVectorMap from "jsvectormap";
import "jsvectormap/dist/maps/world.js";
import { CommonModule } from "@angular/common";
import { MapStyleService } from "../../services/map-style.service";
import { COUNTRY_DETAILS } from "../../model/company.model";
import { AppVariablesService } from "../../../../pages/service/app-variables.service";

@Component({
  selector: "app-country-positioning",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./country-positioning.component.html",
  styleUrls: ["./country-positioning.component.css"],
  encapsulation: ViewEncapsulation.None,
})
export class CountryPositioningComponent implements OnInit {
  appVariables = this.appVariablesService.getAppVariables();
  mapStyles: any[] = [];

  constructor(
    private appVariablesService: AppVariablesService,
    private mapStyleService: MapStyleService
  ) {
    this.appVariablesService.variablesReload.subscribe(() => {
      this.appVariables = this.appVariablesService.getAppVariables();
    });
  }

  ngOnInit() {
    this.mapStyles = this.mapStyleService.getMapStyles();
    this.renderMap();
  }

  private generateUniqueColors(count: number): string[] {
    const colors = new Set<string>();
    while (colors.size < count) {
      colors.add(this.generateRandomColor());
    }
    return Array.from(colors);
  }

  private generateRandomColor(): string {
    return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
  }

  renderMap() {
    var elm = document.getElementById("mapContainer") as HTMLElement;

    if (elm) {
      elm.innerHTML = '<div id="map" class="h-100"></div>';

      // Obtener lista de países excluyendo "us"
      const countryKeys = Object.keys(COUNTRY_DETAILS).filter(
        (key) => key !== "us"
      );

      // Generar colores únicos
      const uniqueColors = this.generateUniqueColors(countryKeys.length);

      // Construir escala y valores para los países
      const scale: Record<string, string> = {};
      const values: Record<string, string> = {};

      countryKeys.forEach((key, index) => {
        scale[key] = uniqueColors[index];
        values[key.toUpperCase()] = key;
      });

      const map = new jsVectorMap({
        selector: "#map",
        map: "world",
        zoomButtons: true,
        normalizeFunction: "polynomial",
        hoverOpacity: 0.5,
        hoverColor: false,
        zoomOnScroll: false,
        series: {
          regions: [
            {
              attribute: "fill",
              scale: scale,
              values: values,
            },
          ],
        },
        focusOn: {
          x: 0.5,
          y: 0.5,
          scale: 1,
        },
        labels: {
          markers: {
            render: (marker: any) => marker.name,
          },
        },
        markers: countryKeys.map((key) => ({
          name: COUNTRY_DETAILS[key].name,
          coords: COUNTRY_DETAILS[key].coords,
        })),

        markerStyle: {
          initial: {
            fill: this.appVariables.color.teal,
            stroke: "none",
            r: 5,
          },
          hover: { fill: this.appVariables.color.theme },
        },
        markerLabelStyle: {
          initial: {
            fontFamily: this.appVariables.font.bodyFontFamily,
            fontSize: "12px",
            fill: this.appVariables.color.bodyColor,
          },
        },

        regionStyle: {
          initial: {
            fill: this.appVariables.color.gray600,
            fillOpacity: 0.5,
            stroke: "none",
            strokeWidth: 0.4,
            strokeOpacity: 1,
          },
          hover: {
            fillOpacity: 0.75,
          },
        },
        backgroundColor: "transparent",

        // Agregar manejadores de eventos
        onLoaded: (mapInstance: any) => {
          //console.log("Map fully rendered", mapInstance);
        },
        onViewportChange: (scale: number, transX: number, transY: number) => {
          //console.log("Viewport changed", { scale, transX, transY });
        },
        onRegionClick: (event: Event, code: string) => {
          const countryName = COUNTRY_DETAILS[code.toLowerCase()]?.name || "No tenemos DATA en este pais";
          alert(` ${countryName}`);
        },
        onMarkerClick: (event: Event, markerIndex: number) => {
          const marker = map.markers[markerIndex];
          alert(`Marker clicked: ${marker.name}`);
        },
        onRegionSelected: (code: string, isSelected: boolean, selectedRegions: string[]) => {
          //console.log("Region selected", { code, isSelected, selectedRegions });
        },
        onMarkerSelected: (index: number, isSelected: boolean, selectedMarkers: number[]) => {
          //console.log("Marker selected", { index, isSelected, selectedMarkers });
        },
        onRegionTooltipShow: (event: Event, tooltip: HTMLElement, code: string) => {
          //console.log("Region tooltip shown", { event, tooltip, code });
        },
        onMarkerTooltipShow: (event: Event, tooltip: HTMLElement, code: string) => {
          //console.log("Marker tooltip shown", { event, tooltip, code });
        },
      });

      // Aplicar zoom en los países de interés
      setTimeout(() => {
        map.setFocus({
          regions: countryKeys.map((key) => key.toUpperCase()),
          scale: 2,
          animate: true,
        });
      }, 500);
    }
  }
}